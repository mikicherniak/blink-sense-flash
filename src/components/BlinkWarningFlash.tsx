import React, { useEffect } from 'react';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface BlinkWarningFlashProps {
  isVisible: boolean;
  effect: WarningEffect;
}

export const BlinkWarningFlash: React.FC<BlinkWarningFlashProps> = ({ isVisible, effect }) => {
  useEffect(() => {
    if (isVisible && effect === 'flash') {
      window.postMessage({ type: 'BLINX_FLASH' }, '*');
    }
  }, [isVisible, effect]);

  if (!isVisible) return null;
  
  if (effect === 'flash') {
    return (
      <div className="fixed inset-0 pointer-events-none z-[99999] w-screen h-screen bg-white/80 animate-[flash_200ms_ease-out]" />
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] w-screen h-screen backdrop-blur-md transition-all duration-1000 cubic-bezier(.25,.1,.25,1)" />
  );
};