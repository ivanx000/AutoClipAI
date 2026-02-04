'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaskBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WatermarkRemoverProps {
  onJobStarted: (jobId: string, filename: string) => void;
}

export default function WatermarkRemover({ onJobStarted }: WatermarkRemoverProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [maskBox, setMaskBox] = useState<MaskBox>({ x: 10, y: 10, width: 150, height: 50 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload MP4, MOV, or MKV files only.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    
    // Create video preview
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  }, []);

  const getRelativeCoords = (e: React.MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.current || !videoRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const displayWidth = containerRef.current.clientWidth;
    const displayHeight = containerRef.current.clientHeight;
    
    // Calculate scale factor
    const scaleX = videoWidth / displayWidth;
    const scaleY = videoHeight / displayHeight;
    
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getRelativeCoords(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setDrawStart(coords);
    setMaskBox({ ...coords, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    
    const coords = getRelativeCoords(e);
    if (!coords) return;
    
    setMaskBox({
      x: Math.min(drawStart.x, coords.x),
      y: Math.min(drawStart.y, coords.y),
      width: Math.abs(coords.x - drawStart.x),
      height: Math.abs(coords.y - drawStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawStart(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mask_box', `${maskBox.x},${maskBox.y},${maskBox.width},${maskBox.height}`);

      const response = await fetch('http://localhost:8000/api/v1/tools/remove-watermark', {
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
      setError(err instanceof Error ? err.message : 'Failed to start watermark removal');
    } finally {
      setUploading(false);
    }
  };

  const getMaskStyle = (): React.CSSProperties => {
    if (!videoRef.current || !containerRef.current) return {};
    
    const videoWidth = videoRef.current.videoWidth || 1;
    const videoHeight = videoRef.current.videoHeight || 1;
    const displayWidth = containerRef.current.clientWidth;
    const displayHeight = containerRef.current.clientHeight;
    
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;
    
    return {
      left: maskBox.x * scaleX,
      top: maskBox.y * scaleY,
      width: maskBox.width * scaleX,
      height: maskBox.height * scaleY,
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white hover:border-blue-400 transition-colors"
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska"
              onChange={handleFileSelect}
              className="hidden"
              id="watermark-upload"
            />
            <label htmlFor="watermark-upload" className="cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Video with Watermark
              </h3>
              <p className="text-slate-500 mb-4">
                Supports MP4, MOV, MKV up to 10GB
              </p>
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium">
                Select Video
              </span>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Video Preview with Mask Drawing */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Draw a box around the watermark
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Click and drag on the video to select the watermark region
              </p>
              
              <div 
                ref={containerRef}
                className="relative bg-black rounded-lg overflow-hidden cursor-crosshair"
                style={{ aspectRatio: '16/9' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {preview && (
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full h-full object-contain"
                    muted
                    onLoadedMetadata={() => {
                      // Force re-render to update mask position
                      setMaskBox(m => ({ ...m }));
                    }}
                  />
                )}
                
                {/* Mask Overlay */}
                <div
                  className="absolute border-2 border-red-500 bg-red-500/30 pointer-events-none"
                  style={getMaskStyle()}
                >
                  <span className="absolute -top-6 left-0 text-xs text-red-500 font-medium whitespace-nowrap">
                    Watermark Area
                  </span>
                </div>
              </div>
            </div>

            {/* Mask Coordinates */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Mask Position (pixels)</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'X', key: 'x' as const },
                  { label: 'Y', key: 'y' as const },
                  { label: 'Width', key: 'width' as const },
                  { label: 'Height', key: 'height' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <input
                      type="number"
                      value={maskBox[key]}
                      onChange={(e) => setMaskBox(m => ({ ...m, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex items-center justify-between">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Choose Different Video
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={uploading || maskBox.width < 10 || maskBox.height < 10}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
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
                  'Remove Watermark'
                )}
              </button>
            </div>

            {error && (
              <div className="px-6 pb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
