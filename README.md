# AIClips 🎬✨

Your complete AI toolkit for video creation. Viral clips, captions, voiceovers, and more — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-teal?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?logo=supabase)

## 🚀 Live Demo

- **Frontend:** Hosted on [Vercel](https://vercel.com)
- **Backend:** Hosted on [Railway](https://railway.app)
- **Auth & DB:** [Supabase](https://supabase.com)

---

## ✨ Features

| Tool | Description | Status |
|------|-------------|--------|
| 🔥 **Viral Clips** | AI finds engaging moments from long-form videos, creates short clips for TikTok/Reels/Shorts | ✅ Ready |
| 💬 **AI Captions** | Generate word-level synced captions with multiple styles | ✅ Ready |
| ✨ **Watermark Remover** | AI-powered watermark detection and removal | ✅ Ready |
| 🧹 **Caption Remover** | Remove hardcoded captions/subtitles from videos | ✅ Ready |
| 🎙️ **Text to Speech** | Natural-sounding voiceovers with multiple AI voices | ✅ Ready |
| 🎬 **AI Video Generation** | Text-to-video creation with Sora | 🔜 Coming Soon |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │     Railway     │     │    Supabase     │
│   (Frontend)    │────▶│    (Backend)    │────▶│  (Auth + DB)    │
│   Next.js 16    │     │  FastAPI/Python │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🛠️ Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- FFmpeg (for video processing)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env

# Start server
python api.py
# API runs at http://localhost:8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

# Start dev server
npm run dev
# App runs at http://localhost:3000
```

---

## 📁 Project Structure

```
AIClips/
├── backend/                    # Python FastAPI backend
│   ├── api.py                  # Main API server
│   ├── pipeline.py             # Video processing pipeline
│   ├── services/
│   │   └── video_cleaner.py    # Watermark/caption removal
│   ├── requirements.txt
│   ├── nixpacks.toml           # Railway deployment config
│   └── .env                    # API keys (create this)
│
├── frontend/                   # Next.js web interface
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Auth pages
│   │   │   ├── signup/
│   │   │   └── tools/          # Tool pages
│   │   │       ├── captions/
│   │   │       ├── watermark/
│   │   │       ├── caption-remover/
│   │   │       ├── viral-clips/
│   │   │       ├── text-to-speech/
│   │   │       └── video-generation/
│   │   ├── components/
│   │   │   ├── ToolPageLayout.tsx
│   │   │   ├── ToolsDashboard.tsx
│   │   │   └── ...
│   │   └── lib/
│   │       └── supabase/       # Supabase client
│   ├── middleware.ts           # Auth middleware
│   └── .env.local              # Environment vars (create this)
│
├── data/                       # Processing data (gitignored)
│   ├── uploads/
│   ├── output/
│   └── transcripts/
│
├── railway.toml                # Railway deployment config
└── README.md
```

---

## 🌐 API Endpoints

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/upload` | Upload a video file (up to 10GB) |
| POST | `/api/process/{job_id}` | Start processing |
| GET | `/api/status/{job_id}` | Get job status |
| GET | `/api/download/{job_id}` | Download result |

### Tool Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tools/remove-watermark` | Remove watermark from video |
| POST | `/api/v1/tools/remove-captions` | Remove hardcoded captions |
| POST | `/api/v1/tools/text-to-speech` | Generate speech from text |

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_PEXELS_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Backend (Railway)
1. Connect your GitHub repo to Railway
2. Set root directory to `backend`
3. Add environment variables:
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy

### Auth & Database (Supabase)
1. Create a new Supabase project
2. Enable Email Auth in Authentication settings
3. Copy your project URL and anon key to the frontend env vars

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Video Processing | MoviePy, FFmpeg, OpenCV |
| Transcription | faster-whisper (large-v3-turbo) |
| AI Analysis | Google Gemini 2.5 Flash |
| Text-to-Speech | Microsoft Edge TTS |
| Auth | Supabase Auth |
| Hosting | Vercel (frontend), Railway (backend) |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
