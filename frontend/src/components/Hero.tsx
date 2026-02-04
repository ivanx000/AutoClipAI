'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchMixedVideos } from '@/lib/pexels';

export default function Hero() {
  const [videoSources, setVideoSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      // Fetch videos from 3 different engaging categories
      const videos = await fetchMixedVideos(
        ['contentCreator', 'urban', 'lifestyle'],
        1
      );
      if (videos.length > 0) {
        setVideoSources(videos);
      }
      setIsLoading(false);
    }
    loadVideos();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const videoVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: 'easeOut' },
    },
  };

  // Fallback gradients for when videos are loading or unavailable
  const fallbackGradients = [
    'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    'linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
  ];

  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden">
      {/* Three Vertical Video Containers - Full Bleed */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="video-container flex-1 h-full relative"
            variants={videoVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.2 }}
          >
            {/* Video element */}
            {!isLoading && videoSources[index] && (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  // Hide video if it fails to load
                  (e.target as HTMLVideoElement).style.display = 'none';
                }}
              >
                <source src={videoSources[index]} type="video/mp4" />
              </video>
            )}

            {/* Loading shimmer effect */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 animate-pulse" />
            )}

            {/* Fallback gradient if video doesn't load */}
            <div 
              className="absolute inset-0 -z-10"
              style={{ background: fallbackGradients[index] }}
            />

            {/* Frosted glass overlay - reduced for better video visibility */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
            
            {/* Subtle divider lines between videos */}
            {index < 2 && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/50 to-transparent z-10" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Floating badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 float-shadow"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-black">AI-Powered Video Clipping</span>
          </motion.div>

          {/* Main headline with staggered reveal */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-slate-900">AI</span>
            <span className="gradient-text">Clips</span>
          </motion.h1>

          {/* Value proposition */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-black max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Transform hours of raw footage into viral-ready clips.
            <span className="block mt-2 text-black/80">
              Automatic hooks. Perfect framing. Instant captions.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard">
              <motion.button
                className="px-8 py-4 bg-slate-900 text-white font-semibold text-lg rounded-full hover:bg-slate-800 transition-all duration-300 float-shadow"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Creating For Free
              </motion.button>
            </Link>
            <motion.button
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold text-lg rounded-full border border-slate-200 hover:border-slate-300 hover:bg-white transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating metrics */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { value: '10M+', label: 'Clips Created' },
              { value: '500+', label: 'Happy Brands' },
              { value: '99%', label: 'Accuracy' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-black/80 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-2 bg-slate-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
