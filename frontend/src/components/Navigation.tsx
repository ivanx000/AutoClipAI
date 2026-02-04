'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span 
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AIClips
          </span>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'Home', href: '#hero' },
            { name: 'Features', href: '#how-it-works' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Support', href: '#' },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('#')) {
                  e.preventDefault();
                  const element = document.querySelector(item.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else if (item.href === '#hero') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
              className="text-sm font-medium text-black hover:text-black/70 transition-colors duration-300"
              whileHover={{ y: -1 }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            className="px-4 py-2 text-sm font-medium text-black hover:text-black/70 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            Sign In
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden flex flex-col gap-1.5 cursor-pointer p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.span
            className="w-5 h-0.5 bg-slate-900 block rounded-full"
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-slate-900 block rounded-full"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-slate-900 block rounded-full"
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          />
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-slate-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-6 space-y-4">
              {[
                { name: 'Home', href: '#hero' },
                { name: 'Features', href: '#how-it-works' },
                { name: 'Pricing', href: '#pricing' },
                { name: 'Support', href: '#' },
              ].map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      setIsOpen(false);
                      const element = document.querySelector(item.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else if (item.href === '#hero') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className="block text-lg font-medium text-black hover:text-black/70 transition-colors duration-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item.name}
                </motion.a>
              ))}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button className="w-full py-3 text-black font-medium">
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
