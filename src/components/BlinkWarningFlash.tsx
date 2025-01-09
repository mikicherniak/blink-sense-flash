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
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      if (isVisible) {
        const eased = progress * progress * progress * progress;
        setBlurAmount(12 * eased);
      } else {
        setBlurAmount(0);
        return; // Stop animation immediately when not visible
      }

      if (progress < 1 && isVisible) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isVisible) {
      startTime = 0;
      animationFrame = requestAnimationFrame(animate);
    } else {
      setBlurAmount(0); // Immediately set blur to 0 when not visible
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      setBlurAmount(0);
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