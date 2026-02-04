'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section id="pricing" ref={containerRef} className="relative py-32 bg-white overflow-hidden">
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/60 to-cyan-100/60 rounded-full blur-3xl"
        style={{ y }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/60 to-purple-100/60 rounded-full blur-3xl"
        style={{ y: useTransform(y, v => -v) }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Main headline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to <span className="gradient-text">Transform</span> Your Content?
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Choose the plan that fits your needs
          </motion.p>

          {/* Pricing Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch"
          >
            {/* Free Plan */}
            <motion.div
              className="relative p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                {['5 clips per month', 'Basic captions', '720p export', 'Watermark included'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-auto">
                <motion.button
                  className="w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>

            {/* Starter Plan */}
            <motion.div
              className="relative p-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/20 flex flex-col"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-blue-600 text-xs font-bold rounded-full">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                {['50 clips per month', 'AI captions', '1080p export', 'No watermark', 'Priority processing'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white">
                    <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-auto">
                <motion.button
                  className="w-full py-3 bg-white text-blue-600 font-medium rounded-full hover:bg-blue-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Free Trial
                </motion.button>
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              className="relative p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$49</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                {['Unlimited clips', 'AI captions + styles', '4K export', 'No watermark', 'API access', 'Dedicated support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-auto">
                <motion.button
                  className="w-full py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go Pro
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-8 text-slate-400"
          >
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              5 free clips included
            </span>
          </motion.div>
        </motion.div>

        {/* Floating testimonial cards */}
        <motion.div
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              quote: "Cut our editing time by 90%. Absolute game-changer.",
              author: "Sarah K.",
              role: "Content Creator",
            },
            {
              quote: "The caption accuracy is unbelievable. No more manual syncing.",
              author: "Marcus T.",
              role: "Brand Manager",
            },
            {
              quote: "Finally, a tool that actually understands viral content.",
              author: "Jamie L.",
              role: "Social Media Lead",
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="relative p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 float-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="text-blue-400 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">{testimonial.quote}</p>
              <div>
                <p className="font-semibold text-slate-900">{testimonial.author}</p>
                <p className="text-sm text-slate-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
