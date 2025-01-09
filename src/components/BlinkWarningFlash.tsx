import React, { useEffect, useState } from 'react';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface BlinkEffectProps {
  isVisible: boolean;
  effect: WarningEffect;
  isDark?: boolean;
}

export const BlinkEffect: React.FC<BlinkEffectProps> = ({ isVisible, effect, isDark }) => {
  const [blurAmount, setBlurAmount] = useState(0);

  useEffect(() => {
    if (isVisible && effect === 'flash') {
      window.postMessage({ type: 'BLINX_FLASH', isDark }, '*');
    }
  }, [isVisible, effect, isDark]);

  useEffect(() => {
    if (isVisible && effect === 'blur') {
      setBlurAmount(8);
      const timer = setTimeout(() => {
        setBlurAmount(0);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Immediately set blur to 0 without transition
      setBlurAmount(0);
    }
  }, [isVisible, effect]);

  if (effect === 'flash') {
    return isVisible ? (
      <div 
        className={`fixed inset-0 pointer-events-none z-[99999] w-screen h-screen ${
          isDark ? 'bg-neutral-950' : 'bg-white'
        } opacity-90`} 
      />
    ) : null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[99999] w-screen h-screen"
      style={{ 
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        opacity: blurAmount > 0 ? 1 : 0,
      }}
    />
  );
};