"""
AutoClipAI FastAPI Server
REST API endpoints for video processing.
"""

import uuid
import shutil
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import pipeline functions
from pipeline import (
    BACKEND_DIR, DATA_DIR, OUTPUT_DIR, UPLOADS_DIR,
    add_captions_to_video, run_viral_pipeline
)

# Import watermark removal service
from services.video_cleaner import watermark_service, caption_remover_service, MaskBox

# Ensure directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# --- APP SETUP ---
app = FastAPI(
    title="AutoClipAI API",
    description="AI-powered video clipping and captioning",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve output videos statically
app.mount("/files", StaticFiles(directory=str(DATA_DIR)), name="files")

# --- IN-MEMORY JOB STORAGE ---
jobs: dict = {}


class JobStatus(BaseModel):
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: int  # 0-100
    message: str
    created_at: str
    filename: Optional[str] = None
    output_file: Optional[str] = None
    error: Optional[str] = None


class ProcessingRequest(BaseModel):
    mode: str = "caption"  # "caption" or "viral"


# --- HELPER FUNCTIONS ---
def create_job(filename: str) -> str:
    """Create a new processing job."""
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="pending",
        progress=0,
        message="Job created, waiting to start...",
        created_at=datetime.now().isoformat(),
        filename=filename
    )
    return job_id


def update_job_progress(job_id: str, progress: int, message: str):
    """Progress callback for pipeline functions."""
    if job_id in jobs:
        jobs[job_id].progress = progress
        jobs[job_id].message = message


async def process_video_task(job_id: str, input_path: Path, mode: str):
    """Background task to process video."""
    try:
        jobs[job_id].status = "processing"
        
        def progress_callback(progress: int, message: str):
            update_job_progress(job_id, progress, message)
        
        if mode == "caption":
            # Simple caption mode
            output_filename = f"{input_path.stem}_captioned.mp4"
            output_path = OUTPUT_DIR / output_filename
            
            add_captions_to_video(
                input_path, 
                output_path,
                progress_callback=progress_callback
            )
            
            jobs[job_id].output_file = f"/files/output/{output_filename}"
            
        elif mode == "viral":
            # Full viral pipeline
            clips = run_viral_pipeline(input_path)
            if clips:
                jobs[job_id].output_file = f"/files/output/{clips[0].name}"
        
        # Update job as complete
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Video processing complete!"
        
        # Clean up input file
        if input_path.exists():
            input_path.unlink()
            
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].error = str(e)
        jobs[job_id].message = f"Processing failed: {str(e)}"


# --- API ENDPOINTS ---

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "AutoClipAI API"}


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file for processing. Supports files up to 10GB."""
    allowed_types = ["video/mp4", "video/quicktime", "video/x-matroska"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Please upload MP4, MOV, or MKV.")
    
    ext = Path(file.filename).suffix
    unique_name = f"{str(uuid.uuid4())[:8]}{ext}"
    file_path = UPLOADS_DIR / unique_name
    
    # Stream large files in chunks to avoid memory issues
    chunk_size = 1024 * 1024  # 1MB chunks
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(chunk_size):
            buffer.write(chunk)
    
    job_id = create_job(file.filename)
    jobs[job_id].filename = unique_name
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "message": "Upload successful. Ready to process."
    }


@app.post("/api/process/{job_id}")
async def process_video(job_id: str, background_tasks: BackgroundTasks, 
                        request: ProcessingRequest = None):
    """Start processing an uploaded video."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    if job.status not in ["pending", "failed"]:
        raise HTTPException(400, f"Job is already {job.status}")
    
    input_path = UPLOADS_DIR / job.filename
    if not input_path.exists():
        raise HTTPException(404, "Uploaded file not found")
    
    mode = request.mode if request else "caption"
    if mode not in ["caption", "viral"]:
        raise HTTPException(400, "Invalid processing mode. Use 'caption' or 'viral'.")
    
    background_tasks.add_task(process_video_task, job_id, input_path, mode)
    
    jobs[job_id].status = "processing"
    jobs[job_id].message = "Processing started..."
    
    return {"job_id": job_id, "status": "processing", "mode": mode}


@app.get("/api/status/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a processing job."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return jobs[job_id]


@app.get("/api/jobs")
async def list_jobs():
    """List all jobs."""
    return list(jobs.values())


@app.get("/api/download/{job_id}")
async def download_result(job_id: str):
    """Download the processed video."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    if job.status != "completed":
        raise HTTPException(400, "Job not completed yet")
    
    output_filename = job.output_file.split("/")[-1]
    output_path = OUTPUT_DIR / output_filename
    
    if not output_path.exists():
        raise HTTPException(404, "Output file not found")
    
    return FileResponse(
        path=str(output_path),
        filename=output_filename,
        media_type="video/mp4"
    )


# --- WATERMARK REMOVAL ENDPOINTS ---

async def watermark_removal_task(job_id: str, input_path: Path, mask_box: MaskBox):
    """Background task for watermark removal."""
    try:
        jobs[job_id].status = "processing"
        
        def progress_callback(progress: int, message: str):
            if job_id in jobs:
                jobs[job_id].progress = progress
                jobs[job_id].message = message
        
        output_filename = f"{input_path.stem}_cleaned.mp4"
        output_path = OUTPUT_DIR / output_filename
        
        watermark_service.process_video(
            input_path=input_path,
            output_path=output_path,
            mask_box=mask_box,
            progress_callback=progress_callback
        )
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Watermark removal complete!"
        jobs[job_id].output_file = f"/files/output/{output_filename}"
        
        # Clean up input file
        if input_path.exists():
            input_path.unlink()
            
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].error = str(e)
        jobs[job_id].message = f"Watermark removal failed: {str(e)}"


@app.post("/api/v1/tools/remove-watermark")
async def remove_watermark(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mask_box: str = "0,0,100,50"  # Default: top-left 100x50 region
):
    """
    Remove watermark from video using AI inpainting.
    
    Args:
        file: Video file (MP4, MOV, MKV)
        mask_box: Watermark region as 'x,y,width,height' string
    
    Returns:
        job_id for tracking progress
    """
    # Validate file type
    allowed_types = ["video/mp4", "video/quicktime", "video/x-matroska"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Please upload MP4, MOV, or MKV.")
    
    # Parse mask coordinates
    try:
        mask = MaskBox.from_string(mask_box)
    except ValueError as e:
        raise HTTPException(400, f"Invalid mask_box format: {e}. Use 'x,y,width,height'.")
    
    # Save uploaded file
    ext = Path(file.filename).suffix
    unique_name = f"{str(uuid.uuid4())[:8]}{ext}"
    file_path = UPLOADS_DIR / unique_name
    
    chunk_size = 1024 * 1024  # 1MB chunks
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(chunk_size):
            buffer.write(chunk)
    
    # Create job
    job_id = create_job(file.filename)
    jobs[job_id].filename = unique_name
    jobs[job_id].message = "Watermark removal queued..."
    
    # Start background processing
    background_tasks.add_task(watermark_removal_task, job_id, file_path, mask)
    
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Watermark removal started. Use /api/status/{job_id} to track progress."
    }


# --- CAPTION REMOVAL ENDPOINTS ---

async def caption_removal_task(job_id: str, input_path: Path, auto_detect: bool):
    """Background task for caption removal."""
    try:
        jobs[job_id].status = "processing"
        
        def progress_callback(progress: int, message: str):
            if job_id in jobs:
                jobs[job_id].progress = progress
                jobs[job_id].message = message
        
        output_filename = f"{input_path.stem}_no_captions.mp4"
        output_path = OUTPUT_DIR / output_filename
        
        caption_remover_service.process_video(
            input_path=input_path,
            output_path=output_path,
            auto_detect=auto_detect,
            progress_callback=progress_callback
        )
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Caption removal complete!"
        jobs[job_id].output_file = f"/files/output/{output_filename}"
        
        # Clean up input file
        if input_path.exists():
            input_path.unlink()
            
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].error = str(e)
        jobs[job_id].message = f"Caption removal failed: {str(e)}"


@app.post("/api/v1/tools/remove-captions")
async def remove_captions(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    auto_detect: bool = True
):
    """
    Remove captions/subtitles from video using AI inpainting.
    
    Args:
        file: Video file (MP4, MOV, MKV)
        auto_detect: Whether to auto-detect caption regions (default True)
    
    Returns:
        job_id for tracking progress
    """
    # Validate file type
    allowed_types = ["video/mp4", "video/quicktime", "video/x-matroska"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Please upload MP4, MOV, or MKV.")
    
    # Save uploaded file
    ext = Path(file.filename).suffix
    unique_name = f"{str(uuid.uuid4())[:8]}{ext}"
    file_path = UPLOADS_DIR / unique_name
    
    chunk_size = 1024 * 1024  # 1MB chunks
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(chunk_size):
            buffer.write(chunk)
    
    # Create job
    job_id = create_job(file.filename)
    jobs[job_id].filename = unique_name
    jobs[job_id].message = "Caption removal queued..."
    
    # Start background processing
    background_tasks.add_task(caption_removal_task, job_id, file_path, auto_detect)
    
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Caption removal started. Use /api/status/{job_id} to track progress."
    }


# --- TEXT TO SPEECH ---

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"


@app.post("/api/v1/tools/text-to-speech")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using Edge TTS.
    
    Args:
        text: Text to convert (max 5000 chars)
        voice: Voice ID (default: en-US-AriaNeural)
    
    Returns:
        audio_url: URL to download the generated MP3
    """
    import edge_tts
    import asyncio
    
    if not request.text.strip():
        raise HTTPException(400, "Text cannot be empty")
    
    if len(request.text) > 5000:
        raise HTTPException(400, "Text exceeds 5000 character limit")
    
    # Valid voices
    valid_voices = [
        "en-US-AriaNeural", "en-US-GuyNeural", "en-US-JennyNeural",
        "en-GB-SoniaNeural", "en-GB-RyanNeural", "en-AU-NatashaNeural"
    ]
    
    voice = request.voice if request.voice in valid_voices else "en-US-AriaNeural"
    
    # Generate unique filename
    audio_filename = f"tts_{str(uuid.uuid4())[:8]}.mp3"
    audio_path = OUTPUT_DIR / audio_filename
    
    try:
        # Generate speech
        communicate = edge_tts.Communicate(request.text, voice)
        await communicate.save(str(audio_path))
        
        return {
            "status": "success",
            "audio_url": f"/files/output/{audio_filename}",
            "voice": voice
        }
    except Exception as e:
        raise HTTPException(500, f"TTS generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
