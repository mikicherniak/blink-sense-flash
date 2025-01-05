import React from 'react';

interface BlinkStatsProps {
  currentBPM: number;
  averageBPM: number;
  sessionDuration: string;
}

export const BlinkStats: React.FC<BlinkStatsProps> = ({ currentBPM, averageBPM, sessionDuration }) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-10 w-full max-w-4xl px-8">
      <div className="bg-neutral-800/80 backdrop-blur-sm rounded-lg p-4 flex-1 border border-neutral-700/40">
        <span className="text-sm text-neutral-300">Current BPM</span>
        <div className="text-2xl font-bold text-neutral-100">{currentBPM}</div>
      </div>
      <div className="bg-neutral-800/80 backdrop-blur-sm rounded-lg p-4 flex-1 border border-neutral-700/40">
        <span className="text-sm text-neutral-300">Average BPM</span>
        <div className="text-2xl font-bold text-neutral-100">{averageBPM}</div>
      </div>
      <div className="bg-neutral-800/80 backdrop-blur-sm rounded-lg p-4 flex-1 border border-neutral-700/40">
        <span className="text-sm text-neutral-300">Session Duration</span>
        <div className="text-2xl font-bold text-neutral-100">{sessionDuration}</div>
      </div>
    </div>
  );
};