# AutoClip AI 🎬

A local AI-powered tool for creating captioned video clips with a modern web interface.

## Features

### 1. **Web Interface** (Recommended)
Upload videos through a beautiful web app and get captioned videos back.

### 2. **CLI Tools** (Advanced)
Run scripts directly for batch processing or automation.

---

## 🚀 Quick Start

### Option 1: Web App (Frontend + Backend)

**Terminal 1 - Start the API Server:**
```bash
cd backend
pip install -r requirements.txt
python api.py
# Server runs at http://localhost:8000
```

**Terminal 2 - Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

Then open http://localhost:3000, click "Get Started", and upload your video!

### Option 2: CLI - Add Captions to a Clip
```bash
# 1. Place your clip in data/clips/
# 2. Run:
python backend/add_captions.py

# 3. Get captioned video from data/output/
```

### Option 3: CLI - Full Viral Clip Pipeline
```bash
# 1. Place long recording in data/videos/
# 2. Run the full pipeline:
python backend/run_pipeline.py

# 3. Get viral clips from data/output/
```

---

## 🛠️ Setup

### Requirements
- Python 3.12+
- Node.js 18+ (for frontend)
- Windows (uses Windows fonts)

### Backend Installation
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Frontend Installation
```bash
cd frontend
npm install
```

### API Key (Only for Full Pipeline)
Create a `.env` file in the `backend/` folder with your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

---

## 📁 Project Structure

```
AutoClipAI/
├── backend/                # Python backend
│   ├── api.py              # FastAPI server (web interface)
│   ├── add_captions.py     # Quick caption generator
│   ├── run_pipeline.py     # Full viral clip pipeline
│   ├── transcribe.py       # Audio transcription (Whisper)
│   ├── analyze.py          # AI highlight detection (Gemini)
│   ├── clip.py             # Video clipping & captions
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API keys (create this)
│
├── frontend/               # Next.js web interface
│   ├── src/
│   │   ├── app/            # Pages
│   │   └── components/     # React components
│   └── package.json
│
├── data/                   # All data files
│   ├── videos/             # Long videos for pipeline
│   ├── clips/              # Short clips for captions
│   ├── uploads/            # Web uploads (auto-managed)
│   ├── transcripts/        # Generated transcripts
│   ├── analysis/           # AI analysis results
│   └── output/             # Final processed videos
│
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/upload` | Upload a video file |
| POST | `/api/process/{job_id}` | Start processing |
| GET | `/api/status/{job_id}` | Get job status |
| GET | `/api/download/{job_id}` | Download result |
| GET | `/api/jobs` | List all jobs |

---

## 🎨 Caption Style

- **Font:** Arial, 42px
- **Style:** White text with black outline
- **Position:** Lower third of video
- **Format:** Single-line captions (auto-splits long text)

To customize, edit the configuration in `backend/api.py` or `backend/add_captions.py`.

---

## ⚙️ Technical Details

- **Backend:** FastAPI + Python
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS
- **Transcription:** `faster-whisper` with `large-v3-turbo` model (local CPU)
- **Video Processing:** `MoviePy` + `FFmpeg`
- **AI Analysis:** Google Gemini 2.5 Flash (for full pipeline only)

---

## License

MIT License - See [LICENSE](LICENSE) for details.

## License

MIT License - See [LICENSE](LICENSE)
