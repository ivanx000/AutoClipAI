# UGC-Sync Landing Page 🎬

A **High-Energy Cyber-Editorial** landing page for UGC-Sync, an AI-powered auto-clipping platform for brands.

## ✨ Features

- **Split-Screen Hero** - Raw chaotic feed vs. perfect sync clip
- **Grid-Breaking Engine Section** - Animated steps with grain overlays and scanning effects
- **Movie Credit Roll CTA** - Bold, cinematic call-to-action
- **Custom Design System** - Electric Lime (#CCFF00) + Vivid Violet accents on deep charcoal

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0f0f12` | Deep charcoal base |
| Electric Lime | `#ccff00` | Primary accent, CTAs |
| Vivid Violet | `#8b5cf6` | Secondary accent |
| Dark Gray | `#1a1a1f` | Cards, containers |

**Typography:**
- Display: Clash Display (brutalist headings)
- Mono: Space Mono (technical details)

## 📁 Structure

```
src/
├── app/
│   ├── globals.css      # Design tokens & animations
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── Navigation.tsx   # Fixed nav with mobile
│   ├── Hero.tsx         # Split-screen hero
│   ├── Engine.tsx       # Features grid
│   └── CTA.tsx          # Movie-style CTA
```

## ⚙️ Tech Stack

- **Next.js 16** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 📜 License

MIT
