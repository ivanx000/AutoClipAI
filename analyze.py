import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_viral_moments(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
        content = f.read()

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are a viral video editor. I will give you a transcript with timestamps.
    Find 3 moments that would make great TikToks/Shorts.
    Look for: High energy, funny jokes, or interesting facts.
    
    Return the result as a numbered list with:
    - Start and End time
    - A catchy title
    - Why it's viral
    
    TRANSCRIPT:
    {content}
    """
    
    response = model.generate_content(prompt)
    return response.text

# Test it on your last transcript
transcript_to_read = "transcripts/Replay 2025-02-18 20-00-00.txt"
if os.path.exists(transcript_to_read):
    print("🧠 Gemini is analyzing your transcript...")
    result = get_viral_moments(transcript_to_read)
    print("\n--- VIRAL MOMENTS FOUND ---")
    print(result)