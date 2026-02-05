'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const tools = [
  {
    number: '01',
    title: 'Viral Clips',
    description: 'AI finds the most engaging moments from long-form videos and creates short clips ready for TikTok, Reels, and Shorts.',
    icon: '🔥',
    color: 'from-amber-400 to-orange-500',
    href: '/tools/viral-clips',
  },
  {
    number: '02',
    title: 'AI Captions',
    description: 'Generate perfectly synced, word-level captions with multiple styles. Export to SRT, VTT, or burned-in.',
    icon: '💬',
    color: 'from-blue-400 to-cyan-500',
    href: '/tools/captions',
  },
  {
    number: '03',
    title: 'Watermark Remover',
    description: 'Automatically detect and remove watermarks from videos using advanced AI inpainting technology.',
    icon: '✨',
    color: 'from-purple-400 to-pink-500',
    href: '/tools/watermark',
  },
  {
    number: '04',
    title: 'Caption Remover',
    description: 'Detect and cleanly remove hardcoded captions or subtitles from any video with AI.',
    icon: '🧹',
    color: 'from-orange-400 to-red-500',
    href: '/tools/caption-remover',
  },
  {
    number: '05',
    title: 'Text to Speech',
    description: 'Transform text into natural-sounding voiceovers with multiple AI voices and accents.',
    icon: '🎙️',
    color: 'from-emerald-400 to-teal-500',
    href: '/tools/text-to-speech',
  },
  {
    number: '06',
    title: 'AI Video Generation',
    description: 'Create stunning videos from text prompts. Powered by cutting-edge AI for photorealistic results.',
    icon: '🎬',
    color: 'from-indigo-400 to-purple-500',
    href: '/tools/video-generation',
    badge: 'Coming Soon',
  },
];

export default function Engine() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  // Section ID for navigation
  const sectionId = 'how-it-works';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section id={sectionId} ref={containerRef} className="relative py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Floating background elements */}
      <motion.div
        className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-cyan-100/40 to-blue-100/40 rounded-full blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl"
        style={{ y: y2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-2 mb-6 text-sm font-medium text-blue-600 bg-blue-50 rounded-full"
          >
            AI-Powered Tools
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to
            <span className="gradient-text"> Create</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-500 max-w-2xl mx-auto"
          >
            A complete suite of AI tools for content creators. From viral clips to voiceovers.
          </motion.p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Link href={tool.href}>
                <motion.div
                  className="relative bg-white rounded-3xl p-8 float-shadow border border-slate-100 group overflow-hidden h-full cursor-pointer"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Icon and Badge Row */}
                    <div className="flex items-center justify-between mb-4">
                      <motion.span
                        className="text-4xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {tool.icon}
                      </motion.span>
                      {tool.badge && (
                        <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                      {tool.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Decorative line */}
                    <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${tool.color} opacity-50 group-hover:w-full group-hover:opacity-100 transition-all duration-500`} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats - Dynamic Cards */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { value: 6, label: 'AI Tools', suffix: '', icon: '🛠️', color: 'from-blue-500 to-cyan-500' },
            { value: 5, label: 'Processing Time', suffix: 'min', prefix: '<', icon: '⚡', color: 'from-amber-500 to-orange-500' },
            { value: 99, label: 'Accuracy', suffix: '%', icon: '🎯', color: 'from-emerald-500 to-teal-500' },
            { value: 10, label: 'Max Upload', suffix: 'GB', icon: '📦', color: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative text-center p-8 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Floating icon */}
                <motion.div
                  className="text-3xl mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                
                {/* Animated counter */}
                <motion.p 
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {stat.prefix}{stat.value}{stat.suffix}
                </motion.p>
                
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                
                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mt-16 text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            Explore All Tools
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
