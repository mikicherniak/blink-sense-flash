import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';
import { triggerBlinkReminder } from '@/components/BlinkReminder';

const LOW_BPM_THRESHOLD = 15;
const WARNING_DELAY = 10000; // 10 seconds

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
        }, 1000);
      }
    } else {
      lowBpmStartTime.current = null;
      setShowWarningFlash(false);
    }
    
    // Original blink reminder check
    const monitoringDuration = now - monitoringStartTime;
    if (monitoringDuration >= 60000 && currentBPM < MIN_BLINKS_PER_MINUTE) {
      triggerBlinkReminder();
    }
  };

  return {
    showWarningFlash,
    checkBlinkRate
  };
};