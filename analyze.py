import os
from google import genai
from dotenv import load_dotenv

# 1. Setup
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env file.")
    exit()

# Initialize the new Client
client = genai.Client(api_key=api_key)

# --- CONFIGURATION ---
TRANSCRIPT_DIR = "transcripts"
ANALYSIS_DIR = "analysis_results"
os.makedirs(ANALYSIS_DIR, exist_ok=True)

def analyze_transcript(file_path, filename):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"🧠 Gemini is analyzing: {filename}...")

    # System instruction sets the 'editor' persona
    instruction = "You are a viral video strategist. Find 3 high-energy clips from this transcript."

    prompt = f"""
    Based on the following transcript, identify 3 moments with high viral potential.
    For each moment, provide:
    1. Start and End timestamps.
    2. A viral title.
    3. A brief explanation of the 'hook'.

    TRANSCRIPT:
    {content}
    """

    try:
        # Using the latest 2.5 Flash model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'system_instruction': instruction}
        )

        # Save result to a new file
        output_name = os.path.splitext(filename)[0] + "_analysis.txt"
        output_path = os.path.join(ANALYSIS_DIR, output_name)
        
        with open(output_path, "w", encoding="utf-8") as out_f:
            out_f.write(response.text)
        
        print(f"✅ Saved analysis to: {output_path}")

    except Exception as e:
        print(f"❌ Error during AI analysis: {e}")

if __name__ == "__main__":
    # Process every txt file in the folder
    files = [f for f in os.listdir(TRANSCRIPT_DIR) if f.endswith(".txt")]
    
    if not files:
        print(f"No transcripts found in {TRANSCRIPT_DIR}. Run transcribe.py first!")
    else:
        for f in files:
            analyze_transcript(os.path.join(TRANSCRIPT_DIR, f), f)
        print("\n✨ All transcripts analyzed!")