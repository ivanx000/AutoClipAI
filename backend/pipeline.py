"""
AutoClipAI Pipeline Module
Core functions for video processing: transcription, analysis, clipping, and captioning.
"""

import os
import re
import time
from pathlib import Path
from typing import List, Dict, Optional, Callable

from moviepy import VideoFileClip, TextClip, CompositeVideoClip
from faster_whisper import WhisperModel
from google import genai
from dotenv import load_dotenv

# --- PATH SETUP ---
BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"

# Directory paths
VIDEOS_DIR = DATA_DIR / "videos"
CLIPS_DIR = DATA_DIR / "clips"
TRANSCRIPTS_DIR = DATA_DIR / "transcripts"
ANALYSIS_DIR = DATA_DIR / "analysis"
OUTPUT_DIR = DATA_DIR / "output"
UPLOADS_DIR = DATA_DIR / "uploads"

# Ensure all directories exist
for dir_path in [VIDEOS_DIR, CLIPS_DIR, TRANSCRIPTS_DIR, ANALYSIS_DIR, OUTPUT_DIR, UPLOADS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# --- CAPTION STYLE CONFIG ---
FONT = "C:/Windows/Fonts/arial.ttf"
FONT_FALLBACK = "Arial"
FONT_SIZE = 42
COLOR = 'white'
STROKE_COLOR = 'black'
STROKE_WIDTH = 2
CAPTION_MARGIN = 0.12

# --- WHISPER MODEL (lazy loaded) ---
_whisper_model = None

def get_whisper_model() -> WhisperModel:
    """Get or initialize the Whisper model (singleton pattern)."""
    global _whisper_model
    if _whisper_model is None:
        print("👂 Loading AI transcription model (large-v3-turbo)...")
        _whisper_model = WhisperModel("large-v3-turbo", device="cpu", compute_type="float32")
    return _whisper_model


# =============================================================================
# TRANSCRIPTION
# =============================================================================

def extract_audio(video_path: Path, output_path: Path) -> None:
    """Extract audio from video file."""
    print(f"🎬 Extracting audio from {video_path.name}...")
    video = VideoFileClip(str(video_path))
    video.audio.write_audiofile(str(output_path), logger=None)
    video.close()


def transcribe_audio(audio_path: Path, model: Optional[WhisperModel] = None) -> List[Dict]:
    """
    Transcribe audio file and return segments with timestamps.
    
    Returns:
        List of dicts with 'start', 'end', 'text' keys
    """
    if model is None:
        model = get_whisper_model()
    
    print(f"📝 Transcribing audio...")
    start_time = time.time()
    
    segments, info = model.transcribe(
        str(audio_path),
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
    
    print(f"⏱️ Transcription took: {time.time() - start_time:.2f}s")
    return transcript_segments


def transcribe_video(video_path: Path, output_path: Optional[Path] = None, 
                     model: Optional[WhisperModel] = None) -> List[Dict]:
    """
    Full transcription pipeline: extract audio, transcribe, optionally save.
    
    Args:
        video_path: Path to video file
        output_path: Optional path to save transcript as .txt
        model: Optional pre-loaded WhisperModel
    
    Returns:
        List of transcript segments
    """
    temp_audio = BACKEND_DIR / f"temp_audio_{os.getpid()}.mp3"
    
    try:
        extract_audio(video_path, temp_audio)
        segments = transcribe_audio(temp_audio, model)
        
        # Save transcript if output path provided
        if output_path:
            with open(output_path, "w", encoding="utf-8") as f:
                for seg in segments:
                    f.write(f"[{seg['start']:.2f}s -> {seg['end']:.2f}s] {seg['text']}\n")
            print(f"✅ Saved transcript to: {output_path}")
        
        return segments
    finally:
        if temp_audio.exists():
            temp_audio.unlink()


def load_transcript(transcript_path: Path) -> List[Dict]:
    """Load a transcript file into segment format."""
    segments = []
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            match = re.search(r"\[(\d+\.?\d*)s\s*->\s*(\d+\.?\d*)s\]\s*(.*)", line)
            if match:
                segments.append({
                    'start': float(match.group(1)),
                    'end': float(match.group(2)),
                    'text': match.group(3).strip()
                })
    return segments


# =============================================================================
# ANALYSIS (Gemini AI)
# =============================================================================

def get_gemini_client():
    """Initialize Gemini client with API key from .env."""
    load_dotenv(BACKEND_DIR / ".env")
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    
    return genai.Client(api_key=api_key)


def analyze_transcript(transcript_text: str, num_clips: int = 3) -> str:
    """
    Use Gemini AI to find viral moments in transcript.
    
    Args:
        transcript_text: Full transcript content
        num_clips: Number of clips to identify
    
    Returns:
        Analysis text with timestamps and recommendations
    """
    client = get_gemini_client()
    
    instruction = "You are a viral video strategist. Find high-energy clips from this transcript."
    
    prompt = f"""
    Based on the following transcript, identify {num_clips} moments with high viral potential.
    For each moment, provide:
    1. Start and End timestamps.
    2. A viral title.
    3. A brief explanation of the 'hook'.

    TRANSCRIPT:
    {transcript_text}
    """
    
    print(f"🧠 Gemini is analyzing transcript...")
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config={'system_instruction': instruction}
    )
    
    return response.text


def analyze_video(video_path: Path, output_path: Optional[Path] = None) -> str:
    """
    Full analysis pipeline: transcribe video and analyze for viral moments.
    """
    # First transcribe
    segments = transcribe_video(video_path)
    transcript_text = "\n".join([f"[{s['start']:.2f}s -> {s['end']:.2f}s] {s['text']}" for s in segments])
    
    # Then analyze
    analysis = analyze_transcript(transcript_text)
    
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(analysis)
        print(f"✅ Saved analysis to: {output_path}")
    
    return analysis


# =============================================================================
# CAPTION GENERATION
# =============================================================================

def split_text_to_lines(text: str, max_width: int, font: str = FONT, 
                        font_size: int = FONT_SIZE) -> List[str]:
    """Split text into lines that fit within max_width."""
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        
        try:
            temp_clip = TextClip(
                text=test_line,
                font=font,
                font_size=font_size,
                method='label'
            )
            text_width = temp_clip.size[0]
            temp_clip.close()
        except:
            text_width = len(test_line) * (font_size // 2)
        
        if text_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
                current_line = word
            else:
                lines.append(word)
    
    if current_line:
        lines.append(current_line)
    
    return lines


def create_caption_clips(segments: List[Dict], video_w: int, video_h: int,
                         time_offset: float = 0) -> List:
    """
    Generate caption TextClips from transcript segments.
    
    Args:
        segments: List of {'start', 'end', 'text'} dicts
        video_w: Video width in pixels
        video_h: Video height in pixels
        time_offset: Offset to subtract from timestamps (for clips)
    
    Returns:
        List of positioned TextClips
    """
    caption_clips = []
    safe_width = int(video_w * (1 - 2 * CAPTION_MARGIN))
    
    for segment in segments:
        start = segment['start'] - time_offset
        end = segment['end'] - time_offset
        text = segment['text']
        
        if not text.strip() or start < 0:
            continue
        
        # Clean up text
        clean_text = text.strip()
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + "..."
        
        # Split into lines
        text_lines = split_text_to_lines(clean_text, safe_width, FONT, FONT_SIZE)
        
        for line_idx, line_text in enumerate(text_lines):
            if not line_text.strip():
                continue
            
            try:
                # Create TextClip
                try:
                    txt = TextClip(
                        text=line_text,
                        font=FONT,
                        font_size=FONT_SIZE,
                        color=COLOR,
                        stroke_color=STROKE_COLOR,
                        stroke_width=STROKE_WIDTH,
                        method='label',
                        margin=(10, 10)
                    )
                except:
                    txt = TextClip(
                        text=line_text,
                        font=FONT_FALLBACK,
                        font_size=FONT_SIZE,
                        color=COLOR,
                        stroke_color=STROKE_COLOR,
                        stroke_width=STROKE_WIDTH,
                        method='label',
                        margin=(10, 10)
                    )
                
                # Calculate timing for each line
                line_duration = (end - start) / len(text_lines)
                line_start = start + (line_idx * line_duration)
                
                txt = txt.with_start(line_start).with_duration(line_duration)
                
                # Position text in lower portion
                text_height = txt.size[1] if txt.size[1] else FONT_SIZE + 20
                bottom_margin = int(video_h * 0.20)
                y_position = video_h - text_height - bottom_margin
                max_y_position = int(video_h * 0.65)
                y_position = min(max_y_position, y_position)
                
                txt = txt.with_position(('center', y_position))
                caption_clips.append(txt)
                
            except Exception as e:
                print(f"⚠️ Caption error for '{line_text[:30]}...': {e}")
                continue
    
    return caption_clips


# =============================================================================
# VIDEO PROCESSING
# =============================================================================

def add_captions_to_video(video_path: Path, output_path: Path,
                          segments: Optional[List[Dict]] = None,
                          progress_callback: Optional[Callable] = None) -> Path:
    """
    Add captions to a video file.
    
    Args:
        video_path: Input video path
        output_path: Output video path
        segments: Optional pre-computed transcript segments
        progress_callback: Optional callback(progress: int, message: str)
    
    Returns:
        Path to output video
    """
    def update_progress(progress: int, message: str):
        if progress_callback:
            progress_callback(progress, message)
        print(f"[{progress}%] {message}")
    
    update_progress(10, "Loading video...")
    
    # Transcribe if segments not provided
    if segments is None:
        update_progress(20, "Transcribing audio...")
        segments = transcribe_video(video_path)
    
    if not segments:
        raise ValueError("No speech detected in video")
    
    update_progress(60, "Adding captions...")
    
    with VideoFileClip(str(video_path)) as video:
        w, h = video.size
        
        captions = create_caption_clips(segments, w, h)
        
        if not captions:
            raise ValueError("No captions generated")
        
        update_progress(80, "Rendering final video...")
        
        final_video = CompositeVideoClip([video] + captions)
        
        final_video.write_videofile(
            str(output_path),
            codec="libx264",
            audio_codec="aac",
            threads=8,
            logger=None,
            fps=int(video.fps)
        )
        
        final_video.close()
    
    update_progress(100, "Complete!")
    return output_path


def time_to_seconds(time_str: str) -> float:
    """Convert time string to seconds."""
    time_str = time_str.lower().replace('s', '').strip()
    if ':' in time_str:
        parts = time_str.split(':')
        if len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(time_str)


def create_viral_clips(video_path: Path, analysis_text: str,
                       transcript_segments: List[Dict]) -> List[Path]:
    """
    Create vertical clips from video based on analysis.
    
    Args:
        video_path: Path to source video
        analysis_text: Gemini analysis with timestamps
        transcript_segments: Pre-computed transcript segments
    
    Returns:
        List of output clip paths
    """
    # Parse timestamps from analysis
    pattern = r"(\d{1,2}:?\d{0,2}:?\d{1,2}\.?\d*)s?\s*(?:-|to|->)\s*(\d{1,2}:?\d{0,2}:?\d{1,2}\.?\d*)s?"
    matches = re.findall(pattern, analysis_text)
    
    if not matches:
        print("⚠️ No clip timestamps found in analysis")
        return []
    
    output_paths = []
    
    print(f"🎬 Creating {len(matches)} viral clips...")
    
    with VideoFileClip(str(video_path)) as full_video:
        w, h = full_video.size
        target_w = int(h * (9/16))  # Vertical aspect ratio
        
        for i, (start_str, end_str) in enumerate(matches):
            try:
                start_sec = time_to_seconds(start_str)
                end_sec = time_to_seconds(end_str)
                
                if start_sec >= end_sec:
                    continue
                
                # Trim and crop to vertical
                raw_clip = full_video.subclipped(start_sec, end_sec)
                vertical_clip = raw_clip.cropped(
                    x_center=int(w/2), y_center=int(h/2),
                    width=target_w, height=int(h)
                )
                
                # Get captions for this time range
                clip_segments = [
                    s for s in transcript_segments
                    if s['start'] < end_sec and s['end'] > start_sec
                ]
                
                captions = create_caption_clips(clip_segments, target_w, h, time_offset=start_sec)
                
                # Composite
                final_video = CompositeVideoClip([vertical_clip] + captions)
                
                output_path = OUTPUT_DIR / f"{video_path.stem}_clip_{i+1}.mp4"
                
                final_video.write_videofile(
                    str(output_path),
                    codec="libx264",
                    audio_codec="aac",
                    threads=8,
                    logger=None,
                    fps=int(full_video.fps)
                )
                
                print(f"💾 Clip {i+1} saved: {output_path.name}")
                output_paths.append(output_path)
                
            except Exception as e:
                print(f"⚠️ Error on clip {i+1}: {e}")
    
    return output_paths


# =============================================================================
# FULL PIPELINES
# =============================================================================

def run_caption_pipeline(input_path: Path, output_path: Optional[Path] = None) -> Path:
    """
    Simple caption pipeline: transcribe and add captions to a video.
    """
    if output_path is None:
        output_path = OUTPUT_DIR / f"{input_path.stem}_captioned.mp4"
    
    return add_captions_to_video(input_path, output_path)


def run_viral_pipeline(video_path: Path) -> List[Path]:
    """
    Full viral clip pipeline: transcribe -> analyze -> create clips.
    
    Returns:
        List of created clip paths
    """
    print(f"\n{'='*50}")
    print(f"  AutoClipAI Viral Pipeline")
    print(f"{'='*50}")
    print(f"📁 Processing: {video_path.name}")
    
    # Step 1: Transcribe
    print("\n📝 Step 1: Transcribing...")
    transcript_path = TRANSCRIPTS_DIR / f"{video_path.stem}.txt"
    segments = transcribe_video(video_path, transcript_path)
    
    # Step 2: Analyze
    print("\n🧠 Step 2: Analyzing for viral moments...")
    transcript_text = "\n".join([f"[{s['start']:.2f}s -> {s['end']:.2f}s] {s['text']}" for s in segments])
    analysis = analyze_transcript(transcript_text)
    
    analysis_path = ANALYSIS_DIR / f"{video_path.stem}_analysis.txt"
    with open(analysis_path, "w", encoding="utf-8") as f:
        f.write(analysis)
    print(f"✅ Saved analysis to: {analysis_path}")
    
    # Step 3: Create clips
    print("\n🎬 Step 3: Creating viral clips...")
    clips = create_viral_clips(video_path, analysis, segments)
    
    print(f"\n{'='*50}")
    print(f"✨ Pipeline complete! Created {len(clips)} clips.")
    print(f"{'='*50}")
    
    return clips
