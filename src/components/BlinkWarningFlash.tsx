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

  if (effect === 'flash') {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-[99999] w-screen h-screen bg-white/80 animate-[flash_200ms_ease-out]" />
    );
  }

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-[99999] w-screen h-screen ${
        isVisible ? 'animate-in fade-in blur-in duration-[2000ms]' : ''
      }`}
      style={{ 
        backdropFilter: isVisible ? 'blur(8px)' : 'none',
        transition: isVisible ? 'backdrop-filter 2000ms cubic-bezier(0.075, 0.02, 0.165, 1)' : 'none'
      }}
    />
  );
};