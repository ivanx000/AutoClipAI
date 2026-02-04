import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIClips | AI-Powered Video Clipping Platform",
  description: "Transform hours of raw footage into viral-ready clips. AI-powered clipping, perfect framing, and automatic captions.",
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
