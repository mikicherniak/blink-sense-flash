import React from 'react';

interface BlinkStatsProps {
  currentBPM: number;
  averageBPM: number;
  sessionDuration: string;
  isDark: boolean;
}

export const BlinkStats: React.FC<BlinkStatsProps> = ({ currentBPM, averageBPM, sessionDuration, isDark }) => {
  const bgClass = isDark ? 'bg-neutral-800/80' : 'bg-background/30';
  const textClass = isDark ? 'text-neutral-100' : 'text-foreground';
  const labelClass = isDark ? 'text-neutral-300' : 'text-foreground';
  const borderClass = isDark ? 'border-neutral-700/40' : 'border-muted/40';

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-10 w-full max-w-4xl px-8">
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 flex-1 border ${borderClass}`}>
        <span className={`text-sm ${labelClass}`}>Current BPM</span>
        <div className={`text-2xl font-bold ${textClass}`}>{currentBPM}</div>
      </div>
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 flex-1 border ${borderClass}`}>
        <span className={`text-sm ${labelClass}`}>Average BPM</span>
        <div className={`text-2xl font-bold ${textClass}`}>{averageBPM}</div>
      </div>
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 flex-1 border ${borderClass}`}>
        <span className={`text-sm ${labelClass}`}>Session Duration</span>
        <div className={`text-2xl font-bold ${textClass}`}>{sessionDuration}</div>
      </div>
    </div>
  );
};