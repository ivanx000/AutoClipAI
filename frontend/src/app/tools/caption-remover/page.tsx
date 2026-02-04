'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CaptionRemover from '@/components/CaptionRemover';

interface JobStatus {
  jobId: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  outputPath?: string;
  error?: string;
}

export default function CaptionRemoverPage() {
  const [job, setJob] = useState<JobStatus | null>(null);

  const handleJobStarted = (jobId: string, filename: string) => {
    setJob({
      jobId,
      filename,
      status: 'processing',
      progress: 0,
    });
    pollJobStatus(jobId);
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/tools/status/${jobId}`);
        if (!response.ok) throw new Error('Failed to get status');
        
        const data = await response.json();
        
        setJob(prev => prev ? {
          ...prev,
          status: data.status,
          progress: data.progress || 0,
          outputPath: data.output_path,
          error: data.error,
        } : null);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);
  };

  const handleReset = () => {
    setJob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
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
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
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
        {!job ? (
          <>
            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">How It Works</h3>
                  <p className="text-white/90">
                    Upload a video with burned-in captions. Our AI will detect the caption 
                    regions and use video inpainting to seamlessly remove them, filling in 
                    the background with intelligent content-aware reconstruction.
                  </p>
                </div>
              </div>
            </motion.div>

            <CaptionRemover onJobStarted={handleJobStarted} />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Status Header */}
              <div className="p-8 text-center border-b border-slate-100">
                {job.status === 'processing' && (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-orange-500 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Removing Captions...</h2>
                    <p className="text-slate-500">This may take a few minutes depending on video length</p>
                  </>
                )}
                
                {job.status === 'completed' && (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Captions Removed!</h2>
                    <p className="text-slate-500">Your clean video is ready to download</p>
                  </>
                )}
                
                {job.status === 'failed' && (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Failed</h2>
                    <p className="text-red-500">{job.error || 'An unexpected error occurred'}</p>
                  </>
                )}
              </div>

              {/* File Info */}
              <div className="p-8 bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{job.filename}</p>
                    <p className="text-xs text-slate-500">Job ID: {job.jobId}</p>
                  </div>
                </div>

                {job.status === 'processing' && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Processing</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${job.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-8 flex items-center justify-center gap-4">
                {job.status === 'completed' && job.outputPath && (
                  <a
                    href={`http://localhost:8000${job.outputPath}`}
                    download
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                  >
                    Download Clean Video
                  </a>
                )}
                
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {job.status === 'failed' ? 'Try Again' : 'Process Another Video'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
