import subprocess
import os
from pathlib import Path

# --- PATH SETUP ---
BACKEND_DIR = Path(__file__).parent

def run_step(script_name):
    script_path = BACKEND_DIR / script_name
    print(f"\n🚀 STARTING: {script_name}")
    process = subprocess.run(["python", str(script_path)], capture_output=False, text=True)
    if process.returncode != 0:
        print(f"❌ {script_name} failed. Stopping pipeline.")
        return False
    return True

if __name__ == "__main__":
    print("--- AutoClipAI Master Pipeline ---")
    
    # 1. Transcribe (Ears)
    if run_step("transcribe.py"):
        # 2. Analyze (Brain)
        if run_step("analyze.py"):
            # 3. Clip (Muscle)
            run_step("clip.py")
            
    print("\n✨ ALL STEPS COMPLETE. Check 'data/output' for your videos!")