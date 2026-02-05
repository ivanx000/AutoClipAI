'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Feature {
  icon: string;
  text: string;
}

interface ToolPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeColor: 'blue' | 'purple' | 'orange' | 'amber' | 'emerald' | 'indigo';
  features: Feature[];
  gradient?: string;
}

const colorMap = {
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-500 to-cyan-500',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-500 to-pink-500',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-500 to-red-500',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-500 to-orange-500',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-500 to-teal-500',
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-500 to-purple-500',
  },
};

export default function ToolPageLayout({
  children,
  title,
  description,
  badge,
  badgeColor,
  features,
}: ToolPageLayoutProps) {
  const colors = colorMap[badgeColor];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
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
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
              <span className="text-white text-xs font-medium">U</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-block px-4 py-1 ${colors.badge} rounded-full text-sm font-medium mb-4`}>
            {badge}
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Features Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {features.map((feature, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 shadow-sm"
            >
              {feature.icon} {feature.text}
            </span>
          ))}
        </motion.div>

        {/* Tool Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
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
