import React, { useEffect, useState } from 'react';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface BlinkEffectProps {
  isVisible: boolean;
  effect: WarningEffect;
}

export const BlinkEffect: React.FC<BlinkEffectProps> = ({ isVisible, effect }) => {
  const [blurAmount, setBlurAmount] = useState(0);

  useEffect(() => {
    if (isVisible && effect === 'flash') {
      window.postMessage({ type: 'BLINX_FLASH' }, '*');
    }
  }, [isVisible, effect]);

  useEffect(() => {
    if (isVisible && effect === 'blur') {
      setBlurAmount(8);
    } else {
      setBlurAmount(0);
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
      className="fixed inset-0 pointer-events-none z-[99999] w-screen h-screen"
      style={{ 
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        opacity: blurAmount > 0 ? 1 : 0,
        transition: blurAmount > 0 ? 'all 3000ms cubic-bezier(0.1, 0.1, 0.7, 1.0)' : 'none'
      }}
    />
  );
};