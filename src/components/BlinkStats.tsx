import React from 'react';

interface BlinkStatsProps {
  currentBPM: number;
  averageBPM: number;
  sessionDuration: string;
}

export const BlinkStats: React.FC<BlinkStatsProps> = ({ currentBPM, averageBPM, sessionDuration }) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-10 w-full max-w-4xl px-8">
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
        <span className="text-sm text-neutral-700">Current BPM</span>
        <div className="text-2xl font-bold text-neutral-700">{currentBPM}</div>
      </div>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
        <span className="text-sm text-neutral-700">Average BPM</span>
        <div className="text-2xl font-bold text-neutral-700">{averageBPM}</div>
      </div>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
        <span className="text-sm text-neutral-700">Session Duration</span>
        <div className="text-2xl font-bold text-neutral-700">{sessionDuration}</div>
      </div>
    </div>
  );
};