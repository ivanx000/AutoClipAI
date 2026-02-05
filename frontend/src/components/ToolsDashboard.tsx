'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  badge?: string;
}

const tools: Tool[] = [
  {
    id: 'captions',
    title: 'AI Captions',
    description: 'Automatically transcribe and add professional captions to your videos with perfect timing.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
    href: '/tools/captions',
    badge: 'Popular',
  },
  {
    id: 'watermark',
    title: 'Watermark Remover',
    description: 'Use AI-powered inpainting to seamlessly remove watermarks and logos from your videos.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
    href: '/tools/watermark',
  },
  {
    id: 'caption-remover',
    title: 'Caption Remover',
    description: 'Intelligently detect and remove existing captions or subtitles from any video.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500',
    href: '/tools/caption-remover',
  },
  {
    id: 'viral-clips',
    title: 'Viral Clips',
    description: 'Upload long-form content and let AI find the most engaging moments to create viral short clips.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
    href: '/tools/viral-clips',
    badge: 'New',
  },
  {
    id: 'video-generation',
    title: 'AI Video Generation',
    description: 'Generate stunning videos from text prompts using cutting-edge AI. Powered by Sora.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-500',
    href: '/tools/video-generation',
    badge: 'Coming Soon',
  },
  {
    id: 'text-to-speech',
    title: 'AI Text to Speech',
    description: 'Convert any text into natural-sounding speech. Listen instantly or download as MP3.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
    href: '/tools/text-to-speech',
    badge: 'New',
  },
];

export default function ToolsDashboard() {
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
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AI-Powered Video Tools
          </motion.div>
          
          <h1 
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What would you like to do?
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Choose from our suite of AI-powered video editing tools to transform your content in seconds.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link href={tool.href}>
                <motion.div
                  className="group relative h-full bg-white rounded-3xl border border-slate-200 p-8 cursor-pointer overflow-hidden"
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Background Gradient on Hover */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />
                  
                  {/* Badge */}
                  {tool.badge && (
                    <div className={`absolute top-4 right-4 px-3 py-1 bg-gradient-to-r ${tool.gradient} text-white text-xs font-bold rounded-full`}>
                      {tool.badge}
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                    {tool.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}>
                    Get Started
                    <svg 
                      className="w-4 h-4 text-current group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      style={{ color: tool.gradient.includes('blue') ? '#3b82f6' : tool.gradient.includes('purple') ? '#8b5cf6' : '#f97316' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: '10M+', label: 'Videos Processed' },
            { value: '99%', label: 'Accuracy Rate' },
            { value: '<2min', label: 'Avg Processing' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
