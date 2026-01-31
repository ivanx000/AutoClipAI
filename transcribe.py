import os
import time
from moviepy import VideoFileClip
from faster_whisper import WhisperModel

# --- CONFIGURATION ---
INPUT_DIR = "input_videos"
OUTPUT_DIR = "transcripts"
AUDIO_TEMP = "temp_audio.mp3"

# Ensure folders exist
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_audio(video_path, output_path):
    print(f"🎬 Extracting audio from {video_path}...")
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_path, logger=None)
    video.close()

def run_transcription(audio_path, video_filename, model):
    transcript_filename = os.path.splitext(video_filename)[0] + ".txt"
    transcript_path = os.path.join(OUTPUT_DIR, transcript_filename)

    print(f"📝 Transcribing {video_filename}...")
    start_time = time.time()
    
    # ADVANCED PARAMETERS:
    # vad_filter=True helps ignore background noise/crosstalk between sentences
    segments, info = model.transcribe(
        audio_path, 
        beam_size=5, 
        word_timestamps=True,
        vad_filter=True, 
        vad_parameters=dict(min_silence_duration_ms=500)
    )

    with open(transcript_path, "w", encoding="utf-8") as f:
        for segment in segments:
            # Adding a speaker tag placeholder (Whisper doesn't natively label speakers)
            line = f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}\n"
            f.write(line)

    print(f"✅ Saved transcript to: {transcript_path}")
    print(f"⏱️ Time taken: {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    # Switching to large-v3-turbo for better speed/accuracy on unclear speech
    # Using float32 since you have 64GB RAM; it's often faster on Intel CPUs than int8
    print("👂 Loading AI model (large-v3-turbo)...")
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="float32")

    videos = [f for f in os.listdir(INPUT_DIR) if f.endswith(('.mp4', '.mkv', '.mov'))]

    if not videos:
        print(f"ℹ️ No videos found in '{INPUT_DIR}'.")
    else:
        for video_file in videos:
            video_full_path = os.path.join(INPUT_DIR, video_file)
            extract_audio(video_full_path, AUDIO_TEMP)
            run_transcription(AUDIO_TEMP, video_file, model)
            
            if os.path.exists(AUDIO_TEMP):
                os.remove(AUDIO_TEMP)

        print("\n✨ All transcripts are ready in the 'transcripts/' folder!")