import React from 'react';

interface BlinkWarningFlashProps {
  isVisible: boolean;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-red-500/50 animate-in pointer-events-none z-[100]" />
  );
};