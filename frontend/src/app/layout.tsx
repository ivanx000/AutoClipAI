import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIClips | AI-Powered Video Clipping Platform",
  description: "Your complete AI toolkit for video creation. Viral clips, captions, voiceovers, watermark removal, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
