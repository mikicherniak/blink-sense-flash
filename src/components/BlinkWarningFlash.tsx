import React, { useEffect } from 'react';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface BlinkEffectProps {
  isVisible: boolean;
  effect: WarningEffect;
}

export const BlinkEffect: React.FC<BlinkEffectProps> = ({ isVisible, effect }) => {
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
    <div 
      className={`fixed inset-0 pointer-events-none z-[99999] w-screen h-screen transition-[backdrop-filter] duration-1000 ease-in-out ${
        isVisible ? 'backdrop-blur-md' : 'backdrop-blur-none'
      }`}
    />
  );
};