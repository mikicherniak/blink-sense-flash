import React from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white/50 animate-[flash_200ms_ease-out] pointer-events-none z-[99999] w-screen h-screen" style={{ position: 'fixed', top: 0, left: 0 }} />
  );
};