'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
          {user ? (
            <>
              <Link href="/tools">
                <motion.button
                  className="px-4 py-2 text-sm font-medium text-black hover:text-black/70 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  Dashboard
                </motion.button>
              </Link>
              <motion.button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-black transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                Sign Out
              </motion.button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <motion.button
                  className="px-4 py-2 text-sm font-medium text-black hover:text-black/70 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
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
                {user ? (
                  <>
                    <Link href="/tools" className="block w-full py-3 text-black font-medium text-center">
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="w-full py-3 text-slate-500 font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block w-full py-3 text-black font-medium text-center">
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="block w-full py-3 text-center text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-medium"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
