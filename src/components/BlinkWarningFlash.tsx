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
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-[99999] w-screen h-screen ${
        effect === 'flash' 
          ? 'bg-white/80 animate-[flash_200ms_ease-out]' 
          : 'animate-[blur_2000ms_ease-in-out]'
      }`} 
    />
  );
};