"""
AutoClipAI FastAPI Server
Provides REST API endpoints for video processing functionality.
"""

import os
import uuid
import shutil
import asyncio
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- PATH SETUP ---
BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"

# Ensure directories exist
UPLOAD_DIR = DATA_DIR / "uploads"
OUTPUT_DIR = DATA_DIR / "output"
CLIPS_DIR = DATA_DIR / "clips"

for dir_path in [UPLOAD_DIR, OUTPUT_DIR, CLIPS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

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
# In production, use Redis or a database
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
    mode: str = "caption"  # "caption" or "pipeline"


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


async def process_video_caption(job_id: str, input_path: Path):
    """Process video with captions (wraps add_captions.py logic)."""
    import time
    from moviepy import VideoFileClip, TextClip, CompositeVideoClip
    
    try:
        # Update status
        jobs[job_id].status = "processing"
        jobs[job_id].progress = 10
        jobs[job_id].message = "Loading AI transcription model..."
        
        # Import Whisper (heavy import, do it here)
        from faster_whisper import WhisperModel
        
        jobs[job_id].progress = 20
        jobs[job_id].message = "Transcribing audio..."
        
        # Extract audio
        temp_audio = BACKEND_DIR / f"temp_{job_id}.mp3"
        video = VideoFileClip(str(input_path))
        video.audio.write_audiofile(str(temp_audio), logger=None)
        
        # Transcribe
        model = WhisperModel("large-v3-turbo", device="cpu", compute_type="float32")
        segments, info = model.transcribe(
            str(temp_audio),
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcript_segments = []
        for segment in segments:
            transcript_segments.append({
                'start': segment.start,
                'end': segment.end,
                'text': segment.text.strip()
            })
        
        # Clean up temp audio
        if temp_audio.exists():
            temp_audio.unlink()
        
        jobs[job_id].progress = 60
        jobs[job_id].message = "Adding captions to video..."
        
        # Create captions
        w, h = video.size
        caption_clips = create_caption_clips(transcript_segments, w, h)
        
        jobs[job_id].progress = 80
        jobs[job_id].message = "Rendering final video..."
        
        # Composite video
        final_video = CompositeVideoClip([video] + caption_clips)
        
        # Output path
        output_filename = f"{input_path.stem}_captioned.mp4"
        output_path = OUTPUT_DIR / output_filename
        
        final_video.write_videofile(
            str(output_path),
            codec="libx264",
            audio_codec="aac",
            threads=8,
            logger=None,
            fps=int(video.fps)
        )
        
        video.close()
        final_video.close()
        
        # Update job as complete
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Video processing complete!"
        jobs[job_id].output_file = f"/files/output/{output_filename}"
        
        # Clean up input file
        if input_path.exists():
            input_path.unlink()
            
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].error = str(e)
        jobs[job_id].message = f"Processing failed: {str(e)}"


def create_caption_clips(segments: list, video_w: int, video_h: int) -> list:
    """Generate caption clips from transcript segments."""
    from moviepy import TextClip
    
    FONT = "C:/Windows/Fonts/arial.ttf"
    FONT_FALLBACK = "Arial"
    FONT_SIZE = 42
    COLOR = 'white'
    STROKE_COLOR = 'black'
    STROKE_WIDTH = 2
    CAPTION_MARGIN = 0.12
    
    caption_clips = []
    safe_width = int(video_w * (1 - 2 * CAPTION_MARGIN))
    
    for segment in segments:
        start = segment['start']
        end = segment['end']
        text = segment['text']
        
        if not text.strip():
            continue
        
        clean_text = text.strip()
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + "..."
        
        try:
            try:
                txt = TextClip(
                    text=clean_text,
                    font=FONT,
                    font_size=FONT_SIZE,
                    color=COLOR,
                    stroke_color=STROKE_COLOR,
                    stroke_width=STROKE_WIDTH,
                    method='caption',
                    size=(safe_width, None),
                    margin=(10, 10)
                )
            except:
                txt = TextClip(
                    text=clean_text,
                    font=FONT_FALLBACK,
                    font_size=FONT_SIZE,
                    color=COLOR,
                    stroke_color=STROKE_COLOR,
                    stroke_width=STROKE_WIDTH,
                    method='caption',
                    size=(safe_width, None),
                    margin=(10, 10)
                )
            
            txt = txt.with_start(start).with_duration(end - start)
            
            text_height = txt.size[1] if txt.size[1] else FONT_SIZE + 20
            bottom_margin = int(video_h * 0.20)
            y_position = video_h - text_height - bottom_margin
            max_y_position = int(video_h * 0.65)
            y_position = min(max_y_position, y_position)
            
            txt = txt.with_position(('center', y_position))
            caption_clips.append(txt)
            
        except Exception as e:
            print(f"Caption error: {e}")
            continue
    
    return caption_clips


# --- API ENDPOINTS ---

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "AutoClipAI API"}


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file for processing."""
    # Validate file type
    allowed_types = ["video/mp4", "video/quicktime", "video/x-matroska"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Please upload MP4, MOV, or MKV.")
    
    # Generate unique filename
    ext = Path(file.filename).suffix
    unique_name = f"{uuid.uuid4()[:8]}{ext}"
    file_path = UPLOAD_DIR / unique_name
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create job
    job_id = create_job(file.filename)
    jobs[job_id].filename = unique_name
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "message": "Upload successful. Ready to process."
    }


@app.post("/api/process/{job_id}")
async def process_video(job_id: str, background_tasks: BackgroundTasks, request: ProcessingRequest = None):
    """Start processing an uploaded video."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    if job.status not in ["pending", "failed"]:
        raise HTTPException(400, f"Job is already {job.status}")
    
    # Get input file path
    input_path = UPLOAD_DIR / job.filename
    if not input_path.exists():
        raise HTTPException(404, "Uploaded file not found")
    
    # Start processing in background
    mode = request.mode if request else "caption"
    
    if mode == "caption":
        background_tasks.add_task(process_video_caption, job_id, input_path)
    else:
        raise HTTPException(400, "Invalid processing mode")
    
    jobs[job_id].status = "processing"
    jobs[job_id].message = "Processing started..."
    
    return {"job_id": job_id, "status": "processing"}


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
    
    # Extract filename from output path
    output_filename = job.output_file.split("/")[-1]
    output_path = OUTPUT_DIR / output_filename
    
    if not output_path.exists():
        raise HTTPException(404, "Output file not found")
    
    return FileResponse(
        path=str(output_path),
        filename=output_filename,
        media_type="video/mp4"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
