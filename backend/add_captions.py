import os
import re
import time
from pathlib import Path
from moviepy import VideoFileClip, TextClip, CompositeVideoClip
from faster_whisper import WhisperModel

# --- PATH SETUP ---
BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent

# --- CONFIGURATION ---
INPUT_DIR = PROJECT_ROOT / "data" / "clips"           # Put your short clips here
OUTPUT_DIR = PROJECT_ROOT / "data" / "output"         # Captioned videos go here
AUDIO_TEMP = BACKEND_DIR / "temp_audio.mp3"

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Caption Style
FONT = "C:/Windows/Fonts/arial.ttf"
FONT_FALLBACK = "Arial"
FONT_SIZE = 42
COLOR = 'white'
STROKE_COLOR = 'black'
STROKE_WIDTH = 2
CAPTION_MARGIN = 0.12  # 12% margin from edges

def extract_audio(video_path, output_path):
    """Extract audio from video for transcription."""
    print(f"🎬 Extracting audio...")
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_path, logger=None)
    video.close()

def transcribe_audio(audio_path, model):
    """Transcribe audio and return segments with timestamps."""
    print(f"📝 Transcribing audio...")
    start_time = time.time()
    
    segments, info = model.transcribe(
        audio_path, 
        beam_size=5, 
        word_timestamps=True,
        vad_filter=True, 
        vad_parameters=dict(min_silence_duration_ms=500)
    )
    
    # Convert generator to list of segment data
    transcript_segments = []
    for segment in segments:
        transcript_segments.append({
            'start': segment.start,
            'end': segment.end,
            'text': segment.text.strip()
        })
    
    print(f"⏱️ Transcription took: {time.time() - start_time:.2f}s")
    return transcript_segments

def split_text_to_single_lines(text, max_width, font, font_size):
    """Split text into multiple single lines that fit within max_width."""
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        
        # Create a temporary TextClip to measure width
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
            # Fallback estimation
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

def create_caption_clips(segments, video_w, video_h):
    """Generate caption clips from transcript segments."""
    caption_clips = []
    safe_width = int(video_w * (1 - 2 * CAPTION_MARGIN))
    
    for segment in segments:
        start = segment['start']
        end = segment['end']
        text = segment['text']
        
        if not text.strip():
            continue
        
        # Clean up text
        clean_text = text.strip()
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + "..."
        
        # Split text into single lines
        text_lines = split_text_to_single_lines(clean_text, safe_width, FONT, FONT_SIZE)
        
        # Create caption for each line
        for line_idx, line_text in enumerate(text_lines):
            if not line_text.strip():
                continue
            
            try:
                # Create single-line caption
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
                
                # Position text in lower portion but ensure it's not cut off
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

def process_video(video_path, model):
    """Process a single video: transcribe and add captions."""
    video_filename = os.path.basename(video_path)
    print(f"\n🎬 Processing: {video_filename}")
    
    # Step 1: Extract audio
    extract_audio(video_path, AUDIO_TEMP)
    
    # Step 2: Transcribe
    segments = transcribe_audio(AUDIO_TEMP, model)
    
    # Clean up temp audio
    if os.path.exists(AUDIO_TEMP):
        os.remove(AUDIO_TEMP)
    
    if not segments:
        print("⚠️ No speech detected in video.")
        return
    
    # Step 3: Add captions to video
    print("🎨 Adding captions to video...")
    
    with VideoFileClip(video_path) as video:
        w, h = video.size
        
        # Create caption clips
        captions = create_caption_clips(segments, w, h)
        
        if not captions:
            print("⚠️ No captions generated.")
            return
        
        # Combine video with captions
        final_video = CompositeVideoClip([video] + captions)
        
        # Output path
        output_filename = os.path.splitext(video_filename)[0] + "_captioned.mp4"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        # Write final video
        final_video.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            threads=12,
            logger=None,
            fps=int(video.fps)
        )
        
        print(f"✅ Saved: {output_path}")

def main():
    print("=" * 50)
    print("    AUTO CAPTION GENERATOR")
    print("=" * 50)
    print(f"\n📁 Input folder: {INPUT_DIR}/")
    print(f"📁 Output folder: {OUTPUT_DIR}/")
    
    # Find videos
    videos = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.mp4', '.mkv', '.mov'))]
    
    if not videos:
        print(f"\n⚠️ No videos found in '{INPUT_DIR}/' folder.")
        print("   Place your video clips there and run again.")
        return
    
    print(f"\n🎥 Found {len(videos)} video(s) to process")
    
    # Load AI model once
    print("\n👂 Loading AI transcription model...")
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="float32")
    
    # Process each video
    for video_file in videos:
        video_path = os.path.join(INPUT_DIR, video_file)
        process_video(video_path, model)
    
    print("\n" + "=" * 50)
    print("✨ All videos processed!")
    print(f"   Check '{OUTPUT_DIR}/' for your captioned videos.")
    print("=" * 50)

if __name__ == "__main__":
    main()
