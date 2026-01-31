# AutoClip AI 🎬

A local, hardware-optimized AI pipeline that extracts "viral" short-form clips from long-form video content.

## 🚀 Technical Highlights
- **Transcription:** Local execution via `faster-whisper` using **Intel oneAPI (oneMKL)** optimizations for high-speed CPU inference on Intel 13th Gen hardware.
- **Intelligence:** Integrated with **Gemini 1.5 Flash** for high-context transcript analysis and "viral hook" detection.
- **Video Muscle:** Automated cropping (16:9 to 9:16) and rendering using **FFmpeg** and `MoviePy`.

## 🛠️ Setup
1. **Environment:**
   - Python 3.12 (Recommended)
   - Intel oneAPI Base Toolkit (for MKL/VPL acceleration)

2. **Installation:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   pip install -r requirements.txt