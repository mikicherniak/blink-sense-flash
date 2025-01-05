import React from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white/95 animate-[flash_200ms_ease-out] pointer-events-none z-[9999] backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-8xl font-black text-red-500 animate-pulse">BLINK!</span>
      </div>
    </div>
  );
};