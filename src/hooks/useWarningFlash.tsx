import { useState, useRef } from 'react';

const EFFECT_DELAY = 3000;
const FLASH_DURATION = 150; // Reduced from 200ms to 150ms
const MIN_SESSION_DURATION = 10000;

export type WarningEffect = 'flash' | 'blur';

export const useEffectTrigger = (
  getCurrentBlinksPerMinute: () => number, 
  monitoringStartTime: number,
  effectType: WarningEffect,
  targetBPM: number = 15
) => {
  const [showEffect, setShowEffect] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBlinkRate = () => {
    const now = Date.now();
    const sessionDuration = now - monitoringStartTime;
    
    if (sessionDuration < MIN_SESSION_DURATION) {
      return;
    }

    const currentBPM = getCurrentBlinksPerMinute();
    console.log('Checking blink rate:', { currentBPM, targetBPM, showEffect });
    
    if (currentBPM < targetBPM) {
      if (!lowBpmStartTime.current) {
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= EFFECT_DELAY) {
        console.log('Effect triggered - Low BPM:', currentBPM, 'Target:', targetBPM);
        setShowEffect(true);
        
        if (effectTimeoutRef.current) {
          clearTimeout(effectTimeoutRef.current);
        }
        
        effectTimeoutRef.current = setTimeout(() => {
          setShowEffect(false);
          lowBpmStartTime.current = now;
        }, effectType === 'flash' ? FLASH_DURATION : 1000);
      }
    } else {
      lowBpmStartTime.current = null;
      if (showEffect) {
        setShowEffect(false);
        if (effectTimeoutRef.current) {
          clearTimeout(effectTimeoutRef.current);
        }
      }
    }
  };

  return {
    showEffect,
    checkBlinkRate
  };
};