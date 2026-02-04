"""
AutoClipAI CLI Runner
Command-line interface for video processing.
"""

import argparse
import sys
from pathlib import Path

from pipeline import (
    VIDEOS_DIR, CLIPS_DIR, OUTPUT_DIR,
    run_caption_pipeline, run_viral_pipeline, get_whisper_model
)


def caption_mode(args):
    """Add captions to videos in clips folder or specified file."""
    if args.input:
        # Process single file
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"❌ File not found: {input_path}")
            return
        
        output_path = Path(args.output) if args.output else None
        run_caption_pipeline(input_path, output_path)
    else:
        # Process all videos in clips folder
        videos = list(CLIPS_DIR.glob("*.mp4")) + list(CLIPS_DIR.glob("*.mov")) + list(CLIPS_DIR.glob("*.mkv"))
        
        if not videos:
            print(f"⚠️ No videos found in '{CLIPS_DIR}/'")
            print("   Place your video clips there or use --input to specify a file.")
            return
        
        print(f"🎥 Found {len(videos)} video(s) to process")
        
        # Pre-load model for efficiency
        get_whisper_model()
        
        for video_path in videos:
            print(f"\n{'='*50}")
            run_caption_pipeline(video_path)
        
        print(f"\n✨ All videos processed! Check '{OUTPUT_DIR}/' for results.")


def viral_mode(args):
    """Run full viral pipeline on videos."""
    if args.input:
        # Process single file
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"❌ File not found: {input_path}")
            return
        run_viral_pipeline(input_path)
    else:
        # Process all videos in videos folder
        videos = list(VIDEOS_DIR.glob("*.mp4")) + list(VIDEOS_DIR.glob("*.mov")) + list(VIDEOS_DIR.glob("*.mkv"))
        
        if not videos:
            print(f"⚠️ No videos found in '{VIDEOS_DIR}/'")
            print("   Place your long videos there or use --input to specify a file.")
            return
        
        for video_path in videos:
            run_viral_pipeline(video_path)
        
        print(f"\n✨ All videos processed! Check '{OUTPUT_DIR}/' for your clips.")


def main():
    parser = argparse.ArgumentParser(
        description="AutoClipAI - AI-powered video clipping and captioning",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py caption                    # Caption all videos in data/clips/
  python run.py caption --input video.mp4  # Caption a specific video
  python run.py viral                      # Run viral pipeline on data/videos/
  python run.py viral --input stream.mp4   # Run viral pipeline on specific video
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Processing mode")
    
    # Caption subcommand
    caption_parser = subparsers.add_parser("caption", help="Add captions to videos")
    caption_parser.add_argument("--input", "-i", help="Input video file (optional)")
    caption_parser.add_argument("--output", "-o", help="Output file path (optional)")
    
    # Viral subcommand  
    viral_parser = subparsers.add_parser("viral", help="Full viral clip pipeline")
    viral_parser.add_argument("--input", "-i", help="Input video file (optional)")
    
    args = parser.parse_args()
    
    if args.command == "caption":
        caption_mode(args)
    elif args.command == "viral":
        viral_mode(args)
    else:
        parser.print_help()
        print("\n💡 Tip: Use 'python run.py caption' or 'python run.py viral'")


if __name__ == "__main__":
    main()
