'use client';

import React, { useState } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import VideoUpload from '@/components/VideoUpload';
import ProcessingStatus from '@/components/ProcessingStatus';

interface Job {
  jobId: string;
  filename: string;
}

export default function CaptionsPage() {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleUploadComplete = (jobId: string, filename: string) => {
    setCurrentJob({ jobId, filename });
  };

  const handleReset = () => {
    setCurrentJob(null);
  };

  return (
    <ToolPageLayout
      title="AI Captions"
      description="Upload your video and our AI will automatically transcribe and add professional captions in seconds."
      badge="🎬 AI Tool"
      badgeColor="blue"
      features={[
        { icon: '🎯', text: 'Auto-sync captions' },
        { icon: '🤖', text: 'AI transcription' },
        { icon: '⚡', text: 'Fast processing' },
        { icon: '✨', text: 'Professional style' },
      ]}
    >
      {!currentJob ? (
        <VideoUpload onUploadComplete={handleUploadComplete} />
      ) : (
        <ProcessingStatus
          jobId={currentJob.jobId}
          filename={currentJob.filename}
          onReset={handleReset}
        />
      )}
    </ToolPageLayout>
  );
}
