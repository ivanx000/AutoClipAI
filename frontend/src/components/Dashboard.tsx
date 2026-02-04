'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import VideoUpload from './VideoUpload';
import ProcessingStatus from './ProcessingStatus';

interface Job {
  jobId: string;
  filename: string;
}

export default function Dashboard() {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleUploadComplete = (jobId: string, filename: string) => {
    setCurrentJob({ jobId, filename });
  };

  const handleReset = () => {
    setCurrentJob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
              AIClips
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">U</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Add Captions to Your Video
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Upload your video and our AI will automatically transcribe and add 
            professional captions in seconds.
          </p>
        </motion.div>

        {/* Features Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { icon: '🎯', text: 'Auto-sync captions' },
            { icon: '🤖', text: 'AI transcription' },
            { icon: '⚡', text: 'Fast processing' },
            { icon: '✨', text: 'Professional style' },
          ].map((feature, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 shadow-sm"
            >
              {feature.icon} {feature.text}
            </span>
          ))}
        </motion.div>

        {/* Upload or Processing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!currentJob ? (
            <VideoUpload onUploadComplete={handleUploadComplete} />
          ) : (
            <ProcessingStatus
              jobId={currentJob.jobId}
              filename={currentJob.filename}
              onReset={handleReset}
            />
          )}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Video',
                description: 'Drag and drop your video file or click to browse. Supports MP4, MOV, and MKV.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'AI Processing',
                description: 'Our AI transcribes your audio and generates perfectly timed captions.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Download',
                description: 'Get your captioned video ready for social media in just minutes.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl border border-slate-200 p-8 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center text-blue-500">
                  {item.icon}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-24 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 AIClips. All rights reserved.</p>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
