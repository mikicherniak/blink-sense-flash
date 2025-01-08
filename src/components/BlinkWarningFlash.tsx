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
        isVisible ? 'animate-in fade-in blur-in duration-300' : 'animate-out fade-out blur-out duration-300'
      }`}
      style={{ 
        backdropFilter: isVisible ? 'blur(8px)' : 'none',
        transition: isVisible ? 'backdrop-filter 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
      }}
    />
  );
};