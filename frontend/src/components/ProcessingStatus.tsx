'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface JobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  filename: string | null;
  output_file: string | null;
  error: string | null;
}

interface ProcessingStatusProps {
  jobId: string;
  filename: string;
  onReset: () => void;
}

export default function ProcessingStatus({ jobId, filename, onReset }: ProcessingStatusProps) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [processing, setProcessing] = useState(false);

  // Start processing
  const startProcessing = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:8000/api/process/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'caption' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start processing');
      }
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  // Poll for status updates
  useEffect(() => {
    if (!processing) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/status/${jobId}`);
        if (response.ok) {
          const data: JobStatus = await response.json();
          setStatus(data);
          
          // Stop polling when complete or failed
          if (data.status === 'completed' || data.status === 'failed') {
            setProcessing(false);
          }
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial poll

    return () => clearInterval(interval);
  }, [jobId, processing]);

  const getStatusColor = () => {
    if (!status) return 'bg-slate-100';
    switch (status.status) {
      case 'processing': return 'bg-blue-100';
      case 'completed': return 'bg-green-100';
      case 'failed': return 'bg-red-100';
      default: return 'bg-slate-100';
    }
  };

  const getStatusTextColor = () => {
    if (!status) return 'text-slate-600';
    switch (status.status) {
      case 'processing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-900">{filename}</h3>
            <p className="text-sm text-slate-500">Job ID: {jobId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} ${getStatusTextColor()}`}>
            {status?.status || 'ready'}
          </span>
        </div>

        {/* Not yet started */}
        {!processing && !status && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Ready to Process</h4>
            <p className="text-slate-500 mb-6">AI will transcribe your video and add professional captions.</p>
            
            <motion.button
              onClick={startProcessing}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Processing
            </motion.button>
          </div>
        )}

        {/* Processing */}
        {status && status.status === 'processing' && (
          <div className="py-8">
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">{status.message}</span>
                <span className="font-medium text-blue-600">{status.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-slate-500">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-sm">Processing your video...</span>
            </div>
          </div>
        )}

        {/* Completed */}
        {status && status.status === 'completed' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Processing Complete!</h4>
            <p className="text-slate-500 mb-6">Your captioned video is ready to download.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a
                href={`http://localhost:8000/api/download/${jobId}`}
                download
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all inline-block text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Download Video
              </motion.a>
              <motion.button
                onClick={onReset}
                className="px-8 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Process Another
              </motion.button>
            </div>
          </div>
        )}

        {/* Failed */}
        {status && status.status === 'failed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Processing Failed</h4>
            <p className="text-red-500 mb-6">{status.error || 'An error occurred during processing.'}</p>
            
            <motion.button
              onClick={onReset}
              className="px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
