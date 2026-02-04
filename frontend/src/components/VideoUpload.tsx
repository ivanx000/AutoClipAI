'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadState {
  isDragging: boolean;
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface VideoUploadProps {
  onUploadComplete: (jobId: string, filename: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    file: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: false }));
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      setState(s => ({ ...s, error: 'Please upload MP4, MOV, or MKV files only.' }));
      return false;
    }
    // 10GB limit for long-form videos (up to 1 hour)
    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxSize) {
      setState(s => ({ ...s, error: 'File size must be under 10GB.' }));
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(s => ({ ...s, isDragging: false, error: null }));
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setState(s => ({ ...s, file }));
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, error: null }));
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setState(s => ({ ...s, file }));
    }
  }, []);

  const handleUpload = async () => {
    if (!state.file) return;

    setState(s => ({ ...s, uploading: true, progress: 0, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', state.file);

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setState(s => ({ ...s, uploading: false, progress: 100 }));
      onUploadComplete(data.job_id, data.filename);
    } catch (error) {
      setState(s => ({
        ...s,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  };

  const clearFile = () => {
    setState({
      isDragging: false,
      file: null,
      uploading: false,
      progress: 0,
      error: null,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!state.file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center
              transition-all duration-300 cursor-pointer
              ${state.isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska"
              className="hidden"
              onChange={handleFileSelect}
            />

            <motion.div
              animate={state.isDragging ? { scale: 1.05 } : { scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Upload Icon */}
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                transition-colors duration-300
                ${state.isDragging ? 'bg-blue-100' : 'bg-slate-100'}
              `}>
                <svg
                  className={`w-8 h-8 transition-colors ${state.isDragging ? 'text-blue-500' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-slate-700">
                  {state.isDragging ? 'Drop your video here' : 'Drag & drop your video'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse • MP4, MOV, MKV up to 500MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              {/* Video Thumbnail */}
              <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{state.file.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{formatFileSize(state.file.size)}</p>
                
                {state.uploading && (
                  <div className="mt-3">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Uploading...</p>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {!state.uploading && (
                <button
                  onClick={clearFile}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Upload Button */}
            {!state.uploading && (
              <motion.button
                onClick={handleUpload}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Upload & Process
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
