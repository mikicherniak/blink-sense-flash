import React from 'react';
import { TEXT_SIZES } from '@/constants/typography';

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
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-2 z-10 w-full max-w-4xl px-4 sm:px-8">
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-2 sm:p-4 border ${borderClass} flex flex-col items-center justify-center`}>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>Current</span>
        <div className={`${TEXT_SIZES.mobile.stats} sm:${TEXT_SIZES.desktop.stats} font-bold ${textClass} leading-none my-1`}>{currentBPM}</div>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>BPM</span>
      </div>
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-2 sm:p-4 border ${borderClass} flex flex-col items-center justify-center`}>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>Average</span>
        <div className={`${TEXT_SIZES.mobile.stats} sm:${TEXT_SIZES.desktop.stats} font-bold ${textClass} leading-none my-1`}>{averageBPM}</div>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>BPM</span>
      </div>
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-2 sm:p-4 border ${borderClass} flex flex-col items-center justify-center`}>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>Session</span>
        <div className={`${TEXT_SIZES.mobile.stats} sm:${TEXT_SIZES.desktop.stats} font-bold ${textClass} leading-none my-1`}>{sessionDuration}</div>
        <span className={`${TEXT_SIZES.mobile.statsLabel} sm:${TEXT_SIZES.desktop.statsLabel} ${labelClass}`}>Duration</span>
      </div>
    </div>
  );
};