'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolPageLayout from '@/components/ToolPageLayout';

interface JobStatus {
  jobId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  clips?: string[];
  error?: string;
}

export default function ViralClipsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload MP4, MOV, or MKV files only.');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      const processRes = await fetch(`http://localhost:8000/api/process/${uploadData.job_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'viral' }),
      });

      if (!processRes.ok) throw new Error('Failed to start processing');

      setJob({
        jobId: uploadData.job_id,
        filename: file.name,
        status: 'processing',
        progress: 0,
        message: 'Starting viral clip detection...',
      });

      pollJobStatus(uploadData.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/status/${jobId}`);
        if (!res.ok) throw new Error('Status check failed');
        const data = await res.json();

        setJob(prev => prev ? {
          ...prev,
          status: data.status,
          progress: data.progress || 0,
          message: data.message || '',
          clips: data.clips,
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
    setFile(null);
    setJob(null);
    setError(null);
  };

  return (
    <ToolPageLayout
      title="Viral Clips"
      description="AI finds the most engaging moments from long-form videos and creates short clips ready for TikTok, Reels, and Shorts."
      badge="🔥 AI Powered"
      badgeColor="amber"
      features={[
        { icon: '🎯', text: 'Viral Moment Detection' },
        { icon: '🤖', text: 'AI-Powered Analysis' },
        { icon: '✂️', text: 'Auto Short Clips' },
        { icon: '📝', text: 'Auto Captions' },
      ]}
    >
      {!job ? (
        <div className="max-w-3xl mx-auto">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center bg-white transition-all ${
                isDragging ? 'border-amber-400 bg-amber-50' : 'border-slate-300 hover:border-amber-400'
              }`}
            >
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-matroska"
                onChange={handleFileSelect}
                className="hidden"
                id="viral-upload"
              />
              <label htmlFor="viral-upload" className="cursor-pointer block">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">Upload Long-Form Video</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Drag and drop your video here, or click to browse. 
                  Works best with podcasts, streams, and vlogs.
                </p>
                <span className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
                  Select Video
                </span>
                <p className="text-xs text-slate-400 mt-4">Supports MP4, MOV, MKV up to 10GB</p>
              </label>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{file.name}</h3>
                    <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-8 flex items-center justify-between">
                <button onClick={() => setFile(null)} className="px-4 py-2 text-slate-600 hover:text-slate-900">
                  ← Choose Different Video
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg transition-shadow"
                >
                  {uploading ? 'Uploading...' : 'Find Viral Clips'}
                </button>
              </div>
              {error && (
                <div className="px-8 pb-8">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 text-center border-b border-slate-100">
              {job.status === 'processing' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-amber-500 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Finding Viral Moments...</h2>
                  <p className="text-slate-500">{job.message}</p>
                </>
              )}
              {job.status === 'completed' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Clips Ready!</h2>
                  <p className="text-slate-500">Your viral clips have been created</p>
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
                  <p className="text-red-500">{job.error}</p>
                </>
              )}
            </div>

            <div className="p-8 bg-slate-50">
              <div className="flex items-center gap-4 mb-6">
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
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Processing</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 flex items-center justify-center gap-4">
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
    </ToolPageLayout>
  );
}
