import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';
import { triggerBlinkReminder } from '@/components/BlinkReminder';

const LOW_BPM_THRESHOLD = 15;
const WARNING_DELAY = 5000; // Reduced to 5 seconds for testing
const FLASH_DURATION = 200; // Match the animation duration

export const useWarningFlash = (getCurrentBlinksPerMinute: () => number, monitoringStartTime: number) => {
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBlinkRate = () => {
    const now = Date.now();
    const currentBPM = getCurrentBlinksPerMinute();
    
    console.log('🔍 Checking blink rate:', {
      currentBPM,
      threshold: LOW_BPM_THRESHOLD,
      lowBpmStartTime: lowBpmStartTime.current,
      timeSinceStart: lowBpmStartTime.current ? now - lowBpmStartTime.current : 0,
      showingWarning: showWarningFlash
    });
    
    if (currentBPM < LOW_BPM_THRESHOLD) {
      if (!lowBpmStartTime.current) {
        console.log('📝 Started tracking low BPM period');
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= WARNING_DELAY) {
        console.log('⚡ Triggering warning flash');
        setShowWarningFlash(true);
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
          console.log('💫 Hiding warning flash');
          setShowWarningFlash(false);
        }, FLASH_DURATION);
      }
    } else {
      if (lowBpmStartTime.current) {
        console.log('✨ Resetting low BPM tracking - normal blink rate detected');
        lowBpmStartTime.current = null;
      }
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