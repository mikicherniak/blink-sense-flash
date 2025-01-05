import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';

const LOW_BPM_THRESHOLD = 12;
const WARNING_DELAY = 3000;
const FLASH_DURATION = 200;
const MIN_SESSION_DURATION = 10000;

export type WarningEffect = 'flash' | 'blur';

export const useWarningFlash = (
  getCurrentBlinksPerMinute: () => number, 
  monitoringStartTime: number,
  warningEffect: WarningEffect
) => {
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBlinkRate = () => {
    const now = Date.now();
    const sessionDuration = now - monitoringStartTime;
    
    if (sessionDuration < MIN_SESSION_DURATION) {
      return;
    }

    const currentBPM = getCurrentBlinksPerMinute();
    
    if (currentBPM < LOW_BPM_THRESHOLD) {
      if (!lowBpmStartTime.current) {
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= WARNING_DELAY) {
        console.log('Warning effect triggered - Low BPM:', currentBPM);
        setShowWarningFlash(true);
        
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarningFlash(false);
          lowBpmStartTime.current = now;
        }, warningEffect === 'flash' ? FLASH_DURATION : 2000);
      }
    } else {
      if (lowBpmStartTime.current) {
        lowBpmStartTime.current = null;
      }
      setShowWarningFlash(false);
    }
  };

  return {
    showWarningFlash,
    checkBlinkRate
  };
};