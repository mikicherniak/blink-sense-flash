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
    let animationFrame: number;
    let startTime: number;
    const duration = 2000; // Increased to 2 seconds for a longer transition

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      if (isVisible) {
        // Ease-in cubic bezier for blur-in effect that starts slow and speeds up
        const eased = progress * progress * progress; // Cubic easing
        setBlurAmount(12 * eased);
      } else {
        // Immediately remove blur when effect ends
        setBlurAmount(0);
      }

      if (progress < 1 && isVisible) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    startTime = 0;
    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible]);

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
        backdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
      }}
    />
  );
};