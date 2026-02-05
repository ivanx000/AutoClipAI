'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ToolPageLayout from '@/components/ToolPageLayout';

const VOICES = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'Female', accent: 'US' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'Male', accent: 'US' },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Female', accent: 'US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'Female', accent: 'UK' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'Male', accent: 'UK' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha', gender: 'Female', accent: 'AU' },
];

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/tools/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voice }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to generate speech');
      }

      const data = await response.json();
      setAudioUrl(`http://localhost:8000${data.audio_url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'speech.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const selectedVoice = VOICES.find(v => v.id === voice);

  return (
    <ToolPageLayout
      title="AI Text to Speech"
      description="Transform your text into natural-sounding speech. Listen instantly or download as MP3."
      badge="🎙️ AI Powered"
      badgeColor="emerald"
      features={[
        { icon: '🎤', text: 'Multiple Voices' },
        { icon: '🌍', text: 'Multiple Accents' },
        { icon: '💾', text: 'MP3 Download' },
        { icon: '▶️', text: 'Instant Playback' },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Text Input */}
          <div className="p-8 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Enter your text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              maxLength={5000}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{text.length} / 5000 characters</span>
              <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="p-8 bg-slate-50 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Select Voice
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    voice === v.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      v.gender === 'Female' ? 'bg-pink-100' : 'bg-blue-100'
                    }`}>
                      {v.gender === 'Female' ? '👩' : '👨'}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">{v.accent} · {v.gender}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="p-8">
            <button
              onClick={handleGenerate}
              disabled={generating || !text.trim()}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Speech...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Generate Speech
                </span>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlay}
                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-emerald-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="text-white">
                    <div className="font-semibold">Your Audio is Ready!</div>
                    <div className="text-sm text-white/80">
                      Voice: {selectedVoice?.name} ({selectedVoice?.accent})
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download MP3
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
