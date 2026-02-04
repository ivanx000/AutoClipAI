# AIClips Landing Page

A premium "Open-Air" landing page for AIClips, an AI-powered video clipping platform for brands and creators.

## Design System

### Colors
- **Background**: `#ffffff` (Pure white)
- **Off-White**: `#f8fafc` (Subtle sections)
- **Slate-900**: `#0f172a` (Primary text)
- **Blue-500**: `#3b82f6` (Primary accent)
- **Cyan-500**: `#06b6d4` (Secondary accent)
- **Indigo-500**: `#6366f1` (Tertiary accent)

### Typography
- **Display**: Space Grotesk (bold, modern headings)
- **Body**: DM Sans (clean, readable body text)

### Effects
- Frosted glass overlays
- Gradient text for headlines
- Floating elements with subtle parallax
- Soft shadows and blur effects

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Design tokens & utilities
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main landing page
├── components/
│   ├── Navigation.tsx   # Sticky nav with scroll effect
│   ├── Hero.tsx         # Full-bleed video hero
│   ├── Engine.tsx       # Floating card features
│   └── CTA.tsx          # Testimonials & CTA section
```

## Development

```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm run start  # Start production server
```

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Customization
Edit `globals.css` for design tokens. Components are in `src/components/`.
