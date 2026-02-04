'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaptionRemoverProps {
  onJobStarted: (jobId: string, filename: string) => void;
}

export default function CaptionRemover({ onJobStarted }: CaptionRemoverProps) {
  const [file, setFile] = useState<File | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload MP4, MOV, or MKV files only.');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('auto_detect', String(autoDetect));

      const response = await fetch('http://localhost:8000/api/v1/tools/remove-captions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      onJobStarted(data.job_id, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start caption removal');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center bg-white transition-all ${
              isDragging 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-slate-300 hover:border-orange-400'
            }`}
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska"
              onChange={handleFileSelect}
              className="hidden"
              id="caption-remover-upload"
            />
            <label htmlFor="caption-remover-upload" className="cursor-pointer block">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Upload Video with Captions
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Drag and drop your video here, or click to browse. 
                We&apos;ll automatically detect and remove any burned-in captions.
              </p>
              <span className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
                Select Video
              </span>
              <p className="text-xs text-slate-400 mt-4">
                Supports MP4, MOV, MKV up to 10GB
              </p>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* File Info */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="p-8 bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Detection Mode</h4>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  autoDetect 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    checked={autoDetect}
                    onChange={() => setAutoDetect(true)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    autoDetect ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                  }`}>
                    {autoDetect && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Auto-Detect Captions</div>
                    <div className="text-sm text-slate-500">AI will find and remove caption regions automatically</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Recommended</span>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  !autoDetect 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    checked={!autoDetect}
                    onChange={() => setAutoDetect(false)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !autoDetect ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                  }`}>
                    {!autoDetect && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Bottom Region Only</div>
                    <div className="text-sm text-slate-500">Remove captions from bottom 15% of video</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 flex items-center justify-between">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Choose Different Video
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Remove Captions'
                )}
              </button>
            </div>

            {error && (
              <div className="px-8 pb-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
