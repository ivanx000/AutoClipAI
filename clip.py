import os
import re
from moviepy import VideoFileClip, TextClip, CompositeVideoClip

# --- CONFIGURATION ---
VIDEO_DIR = "input_videos"
ANALYSIS_DIR = "analysis_results"
TRANSCRIPT_DIR = "transcripts"
OUTPUT_DIR = "output_clips"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Professional Caption Style
FONT = "C:/Windows/Fonts/arial.ttf"  # More readable font
FONT_FALLBACK = "Arial"  # Fallback if file path doesn't work
FONT_SIZE = 45  # Smaller, less intrusive size
COLOR = 'white'
STROKE_COLOR = 'black'
STROKE_WIDTH = 2  # Moderate outline for readability
CAPTION_MARGIN = 0.1  # 10% margin from edges

def time_to_seconds(time_str):
    time_str = time_str.lower().replace('s', '').strip()
    if ':' in time_str:
        parts = time_str.split(':')
        if len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(time_str)

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
                    
                    try:
                        # Create professional caption with proper sizing
                        # Try main font first, fallback if it doesn't work
                        try:
                            txt = TextClip(
                                text=clean_text,
                                font=FONT,
                                font_size=FONT_SIZE,
                                color=COLOR,
                                stroke_color=STROKE_COLOR,
                                stroke_width=STROKE_WIDTH,
                                method='caption',
                                size=(safe_width, None)  # Auto-wrap within safe area
                            )
                        except:
                            # Fallback to system font if file path fails
                            txt = TextClip(
                                text=clean_text,
                                font=FONT_FALLBACK,
                                font_size=FONT_SIZE,
                                color=COLOR,
                                stroke_color=STROKE_COLOR,
                                stroke_width=STROKE_WIDTH,
                                method='caption',
                                size=(safe_width, None)  # Auto-wrap within safe area
                            )
                        
                        txt = txt.with_start(local_start).with_duration(local_end - local_start)
                        
                        # Position in bottom third, but with safe margins
                        y_position = int(video_h * 0.75)  # Bottom third
                        txt = txt.with_position(('center', y_position))
                        
                        caption_clips.append(txt)
                        
                    except Exception as e:
                        print(f"⚠️ Caption error for text '{clean_text[:30]}...': {e}")
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