'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ToolPageLayout from '@/components/ToolPageLayout';

export default function VideoGenerationPage() {
  return (
    <ToolPageLayout
      title="AI Video Generation"
      description="Create stunning, professional videos from simple text prompts. Powered by OpenAI's Sora model."
      badge="✨ Coming Soon"
      badgeColor="indigo"
      features={[
        { icon: '✍️', text: 'Text to Video' },
        { icon: '🎬', text: 'Multiple Styles' },
        { icon: '⚡', text: 'Fast Generation' },
        { icon: '🎨', text: 'Photorealistic' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
          >
            <motion.svg 
              className="w-16 h-16 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </motion.svg>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            In Development
          </motion.div>

          {/* Feature Preview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              { icon: '✍️', title: 'Text to Video', desc: 'Describe any scene and watch it come to life' },
              { icon: '🎬', title: 'Multiple Styles', desc: 'Cinematic, animated, documentary, and more' },
              { icon: '⚡', title: 'Fast Generation', desc: 'Get your videos in minutes, not hours' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 text-left shadow-sm">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Notify Me Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div className="flex items-center gap-2 bg-white rounded-full pl-6 pr-2 py-2 border border-slate-200 shadow-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent outline-none text-slate-900 placeholder:text-slate-400 w-64"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow">
                Notify Me
              </button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-400 mt-4"
          >
            Be the first to know when AI Video Generation launches
          </motion.p>
        </motion.div>
      </div>
    </ToolPageLayout>
  );
}
