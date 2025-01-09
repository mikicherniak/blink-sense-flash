import React from 'react';
import { TEXT_SIZES } from '@/constants/typography';

interface BpmInputProps {
  isDark: boolean;
  targetBPM: number;
  setTargetBPM: (value: number) => void;
}

export const BpmInput: React.FC<BpmInputProps> = ({
  isDark,
  targetBPM,
  setTargetBPM,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>
        Target BPM
      </span>
      <input
        type="number"
        value={targetBPM}
        onChange={(e) => setTargetBPM(Math.max(1, parseInt(e.target.value) || 1))}
        className={`w-[44px] h-6 px-2 text-xs rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-primary ${
          isDark ? 'text-white bg-neutral-600' : 'text-foreground bg-neutral-300'
        }`}
        min="1"
        max="60"
      />
    </div>
  );
};