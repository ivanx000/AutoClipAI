'use client';

import React, { useState } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import WatermarkRemover from '@/components/WatermarkRemover';
import ProcessingStatus from '@/components/ProcessingStatus';

interface Job {
  jobId: string;
  filename: string;
}

export default function WatermarkRemovalPage() {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const handleJobStarted = (jobId: string, filename: string) => {
    setCurrentJob({ jobId, filename });
  };

  const handleReset = () => {
    setCurrentJob(null);
  };

  return (
    <ToolPageLayout
      title="Watermark Remover"
      description="Use AI-powered video inpainting to seamlessly remove watermarks, logos, and unwanted elements from your videos."
      badge="🧹 AI Tool"
      badgeColor="purple"
      features={[
        { icon: '🎯', text: 'Precise selection' },
        { icon: '🤖', text: 'AI inpainting' },
        { icon: '🎬', text: 'Preserves quality' },
        { icon: '⚡', text: 'Batch processing' },
      ]}
    >
      {!currentJob ? (
        <WatermarkRemover onJobStarted={handleJobStarted} />
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
