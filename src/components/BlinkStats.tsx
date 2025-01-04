import React from 'react';
import { Progress } from '@/components/ui/progress';

interface BlinkStatsProps {
  blinksPerMinute: number;
  minBlinksPerMinute: number;
  lastBlinkTime: number;
}

export const BlinkStats = ({ blinksPerMinute, minBlinksPerMinute, lastBlinkTime }: BlinkStatsProps) => {
  const timeSinceLastBlink = Date.now() - lastBlinkTime;
  const isRecentBlink = timeSinceLastBlink < 500; // Show indicator for 500ms after blink

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span>Blinks per minute</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{blinksPerMinute}</span>
          {isRecentBlink && (
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
      </div>
      <Progress value={(blinksPerMinute / minBlinksPerMinute) * 100} />
      <p className="text-sm text-muted-foreground text-center">
        Recommended: {minBlinksPerMinute} blinks per minute
      </p>
    </div>
  );
};