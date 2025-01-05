import { useState, useRef } from 'react';
import { MIN_BLINKS_PER_MINUTE } from '@/utils/blinkDetection';
import { triggerBlinkReminder } from '@/components/BlinkReminder';
import { useToast } from '@/components/ui/use-toast';

const LOW_BPM_THRESHOLD = 12; // Lowered threshold for more frequent reminders
const WARNING_DELAY = 3000; // Reduced to 3 seconds for more frequent checks
const FLASH_DURATION = 200;

export const useWarningFlash = (getCurrentBlinksPerMinute: () => number, monitoringStartTime: number) => {
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
        
        // Show toast notification
        toast({
          title: "Blink Rate Low",
          description: "Remember to blink more frequently!",
          duration: 3000,
        });

        // Trigger the blink reminder
        triggerBlinkReminder();
        
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        warningTimeoutRef.current = setTimeout(() => {
          console.log('💫 Hiding warning flash');
          setShowWarningFlash(false);
          lowBpmStartTime.current = now; // Reset the start time for next check
        }, FLASH_DURATION);
      }
    } else {
      if (lowBpmStartTime.current) {
        console.log('✨ Resetting low BPM tracking - normal blink rate detected');
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