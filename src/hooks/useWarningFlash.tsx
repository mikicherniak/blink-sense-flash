import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';

const LOW_BPM_THRESHOLD = 12;
const WARNING_DELAY = 3000;
const FLASH_DURATION = 200;
const MIN_SESSION_DURATION = 10000; // 10 seconds before starting warnings

export const useWarningFlash = (getCurrentBlinksPerMinute: () => number, monitoringStartTime: number) => {
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBlinkRate = () => {
    const now = Date.now();
    const sessionDuration = now - monitoringStartTime;
    
    // Don't show warnings in the first 10 seconds
    if (sessionDuration < MIN_SESSION_DURATION) {
      return;
    }

    const currentBPM = getCurrentBlinksPerMinute();
    
    // Only show warning if BPM is critically low
    if (currentBPM < LOW_BPM_THRESHOLD) {
      if (!lowBpmStartTime.current) {
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= WARNING_DELAY) {
        console.log('Warning flash triggered - Low BPM:', currentBPM);
        setShowWarningFlash(true);
        
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarningFlash(false);
          lowBpmStartTime.current = now;
        }, FLASH_DURATION);
      }
    } else {
      // Reset the low BPM timer if BPM is normal
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