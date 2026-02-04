import os
import re
from pathlib import Path
from moviepy import VideoFileClip, TextClip, CompositeVideoClip

# --- PATH SETUP ---
BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent

# --- CONFIGURATION ---
VIDEO_DIR = PROJECT_ROOT / "data" / "videos"        # Long videos folder
ANALYSIS_DIR = PROJECT_ROOT / "data" / "analysis"
TRANSCRIPT_DIR = PROJECT_ROOT / "data" / "transcripts"
OUTPUT_DIR = PROJECT_ROOT / "data" / "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Professional Caption Style
FONT = "C:/Windows/Fonts/arial.ttf"  # More readable font
FONT_FALLBACK = "Arial"  # Fallback if file path doesn't work
FONT_SIZE = 42  # Slightly smaller size to ensure full words fit
COLOR = 'white'
STROKE_COLOR = 'black'
STROKE_WIDTH = 2  # Moderate outline for readability
CAPTION_MARGIN = 0.12  # 12% margin from edges for better padding

def time_to_seconds(time_str):
    time_str = time_str.lower().replace('s', '').strip()
    if ':' in time_str:
        parts = time_str.split(':')
        if len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(time_str)

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
                method='label'  # Use label for single line
            )
            text_width = temp_clip.size[0]
            temp_clip.close()  # Clean up
        except:
            # Fallback estimation: assume each character is about font_size/2 pixels
            text_width = len(test_line) * (font_size // 2)
        
        if text_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
                current_line = word
            else:
                # Single word is too long, add it anyway
                lines.append(word)
    
    if current_line:
        lines.append(current_line)
    
    return lines

def get_caption_clips(transcript_filename, start_offset, end_offset, video_w, video_h):
    """Generates professionally styled TextClips that appear only when spoken."""
    transcript_path = os.path.join(TRANSCRIPT_DIR, transcript_filename)
    caption_clips = []
    
    if not os.path.exists(transcript_path): return []

    # Calculate safe text area with proper margins
    safe_width = int(video_w * (1 - 2 * CAPTION_MARGIN))  # Leave margins on sides
    
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            # Matches the [0.00s -> 5.00s] Text format
            match = re.search(r"\[(\d+\.?\d*)s\s*->\s*(\d+\.?\d*)s\]\s*(.*)", line)
            if match:
                s, e, text = float(match.group(1)), float(match.group(2)), match.group(3).strip()
                
                # Only process text spoken WITHIN the current clip's window
                if s < end_offset and e > start_offset:
                    # Timing relative to the 0:00 mark of the NEW clip
                    local_start = max(0, s - start_offset)
                    local_end = min(end_offset - start_offset, e - start_offset)
                    
                    if local_end <= local_start or local_end - local_start < 0.5: continue

                    # Clean up text - no ALL CAPS, proper punctuation
                    clean_text = text.strip()
                    if len(clean_text) > 100:  # Split very long sentences
                        clean_text = clean_text[:97] + "..."
                    
                    # Split text into single lines to prevent wrapping
                    text_lines = split_text_to_single_lines(clean_text, safe_width, FONT, FONT_SIZE)
                    
                    # Create separate caption clips for each line
                    for line_idx, line_text in enumerate(text_lines):
                        if not line_text.strip():
                            continue
                            
                        try:
                            # Create single-line caption
                            # Try main font first, fallback if it doesn't work
                            try:
                                txt = TextClip(
                                    text=line_text,
                                    font=FONT,
                                    font_size=FONT_SIZE,
                                    color=COLOR,
                                    stroke_color=STROKE_COLOR,
                                    stroke_width=STROKE_WIDTH,
                                    method='label',  # Use label for guaranteed single line
                                    margin=(10, 10)  # Add padding around text to prevent cutoff
                                )
                            except:
                                # Fallback to system font if file path fails
                                txt = TextClip(
                                    text=line_text,
                                    font=FONT_FALLBACK,
                                    font_size=FONT_SIZE,
                                    color=COLOR,
                                    stroke_color=STROKE_COLOR,
                                    stroke_width=STROKE_WIDTH,
                                    method='label',  # Use label for guaranteed single line
                                    margin=(10, 10)  # Add padding around text to prevent cutoff
                                )
                            
                            # Calculate timing for this specific line
                            line_duration = (local_end - local_start) / len(text_lines)
                            line_start = local_start + (line_idx * line_duration)
                            line_end = line_start + line_duration
                            
                            txt = txt.with_start(line_start).with_duration(line_duration)
                            
                            # Position text higher up and ensure it's never cut off
                            # Get the actual text height to position it properly
                            text_height = txt.size[1] if txt.size[1] else FONT_SIZE + 20
                            
                            # Position at around 65% down the screen with generous bottom margin
                            # Leave 20% margin at bottom to ensure text is never cut off
                            bottom_margin = int(video_h * 0.20)
                            y_position = video_h - text_height - bottom_margin
                            
                            # Keep text around 60-65% down the screen
                            max_y_position = int(video_h * 0.65)
                            y_position = min(max_y_position, y_position)
                            
                            txt = txt.with_position(('center', y_position))
                            
                            caption_clips.append(txt)
                            
                        except Exception as e:
                            print(f"⚠️ Caption error for text '{line_text[:30]}...': {e}")
                            continue
                    
    return caption_clips

def process_clips(video_filename, analysis_filename):
    video_path = os.path.join(VIDEO_DIR, video_filename)
    analysis_path = os.path.join(ANALYSIS_DIR, analysis_filename)
    # Finding the matching transcript file
    transcript_filename = os.path.splitext(video_filename)[0] + ".txt"
    
    if not os.path.exists(video_path): return

    with open(analysis_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    pattern = r"(\d{1,2}:?\d{0,2}:?\d{1,2}\.?\d*)s?\s*(?:-|to|->)\s*(\d{1,2}:?\d{0,2}:?\d{1,2}\.?\d*)s?"
    matches = re.findall(pattern, content)

    if not matches: return

    print(f"🎬 Processing {len(matches)} viral clips from {video_filename}...")
    
    with VideoFileClip(video_path) as full_video:
        w, h = full_video.size
        target_w = int(h * (9/16))

        for i, (start_str, end_str) in enumerate(matches):
            try:
                start_sec = time_to_seconds(start_str)
                end_sec = time_to_seconds(end_str)
                
                if start_sec >= end_sec: continue

                # 1. Trim & Crop to Vertical
                raw_clip = full_video.subclipped(start_sec, end_sec)
                vertical_clip = raw_clip.cropped(
                    x_center=int(w/2), y_center=int(h/2), 
                    width=target_w, height=int(h)
                )
                
                # 2. Sync Captions for this specific clip
                captions = get_caption_clips(transcript_filename, start_sec, end_sec, target_w, h)
                
                # 3. Layer them together
                final_video = CompositeVideoClip([vertical_clip] + captions)
                
                output_path = os.path.join(OUTPUT_DIR, f"{os.path.splitext(video_filename)[0]}_clip_{i+1}.mp4")
                
                final_video.write_videofile(
                    output_path, 
                    codec="libx264", 
                    audio_codec="aac",
                    threads=12,
                    logger=None,
                    fps=int(full_video.fps)
                )
                print(f"💾 Clip {i+1} saved with dynamic captions!")

            except Exception as e:
                print(f"⚠️ Error on clip {i+1}: {e}")

if __name__ == "__main__":
    for a_file in [f for f in os.listdir(ANALYSIS_DIR) if f.endswith("_analysis.txt")]:
        base_name = a_file.replace("_analysis.txt", "")
        for ext in ['.mp4', '.mov', '.mkv']:
            if os.path.exists(os.path.join(VIDEO_DIR, base_name + ext)):
                process_clips(base_name + ext, a_file)
                break