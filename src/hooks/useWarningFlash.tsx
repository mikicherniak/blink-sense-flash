import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';

const LOW_BPM_THRESHOLD = 12;
const WARNING_DELAY = 3000;
const FLASH_DURATION = 200;

export const useWarningFlash = (getCurrentBlinksPerMinute: () => number, monitoringStartTime: number) => {
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBlinkRate = () => {
    const now = Date.now();
    const currentBPM = getCurrentBlinksPerMinute();
    
    if (currentBPM < LOW_BPM_THRESHOLD) {
      if (!lowBpmStartTime.current) {
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= WARNING_DELAY) {
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