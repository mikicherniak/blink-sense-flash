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
    const duration = 1000; // 1 second

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      if (isVisible) {
        // Ease-in cubic bezier approximation
        const eased = progress * progress * (3 - 2 * progress);
        setBlurAmount(12 * eased);
      } else {
        // Ease-out cubic bezier approximation
        const eased = 1 - Math.pow(1 - progress, 3);
        setBlurAmount(12 * (1 - eased));
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else if (!isVisible) {
        setBlurAmount(0);
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