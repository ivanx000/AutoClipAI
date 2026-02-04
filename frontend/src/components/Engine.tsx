'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Upload',
    description: 'Drop your raw footage. Any length, any format.',
    icon: '📤',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    number: '02',
    title: 'Analyze',
    description: 'AI scans for hooks, energy peaks, and viral moments.',
    icon: '🧠',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    number: '03',
    title: 'Clip',
    description: 'Auto-crops to 9:16 with perfect framing.',
    icon: '✂️',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    number: '04',
    title: 'Caption',
    description: 'Synced captions appear automatically.',
    icon: '💬',
    color: 'from-purple-400 to-pink-500',
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
            How It Works
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            From Raw to
            <span className="gradient-text"> Viral</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-500 max-w-2xl mx-auto"
          >
            Four steps. One click. Unlimited potential.
          </motion.p>
        </motion.div>

        {/* Steps - Floating Card Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative ${index % 2 === 1 ? 'md:translate-y-16' : ''}`}
            >
              <motion.div
                className="relative bg-white rounded-3xl p-8 lg:p-10 float-shadow border border-slate-100 group overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Number and Icon Row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                    <motion.span
                      className="text-4xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.icon}
                    </motion.span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Decorative line */}
                  <div className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${step.color} opacity-50 group-hover:w-full group-hover:opacity-100 transition-all duration-500`} />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Feature Cards */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { value: '< 5min', label: 'Processing Time' },
            { value: '9:16', label: 'Perfect Format' },
            { value: '99%', label: 'Caption Accuracy' },
            { value: '∞', label: 'Clips per Video' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
