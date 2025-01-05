import React from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  console.log('🎯 Rendering warning flash - isVisible:', isVisible);
  
  return (
    <div className="fixed inset-0 bg-white/90 animate-flash pointer-events-none z-[9999]" />
  );
};