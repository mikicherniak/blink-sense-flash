import { useState, useRef, useEffect } from 'react';

const MIN_SESSION_DURATION = 10000;
const FLASH_DURATION = 100;

export type WarningEffect = 'flash' | 'blur';

export const useEffectTrigger = (
  getCurrentBlinksPerMinute: () => number, 
  monitoringStartTime: number,
  effectType: WarningEffect,
  targetBPM: number = 15
) => {
  const [showEffect, setShowEffect] = useState(false);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomInterval = () => {
    return Math.floor(Math.random() * (6000 - 3000) + 3000); // Random between 3-6 seconds
  };

  const checkBlinkRate = () => {
    const now = Date.now();
    const sessionDuration = now - monitoringStartTime;
    
    if (sessionDuration < MIN_SESSION_DURATION) {
      return;
    }

    const currentBPM = getCurrentBlinksPerMinute();
    console.log('Checking blink rate:', { 
      currentBPM, 
      targetBPM, 
      showEffect,
      nextCheckIn: getRandomInterval()
    });
    
    if (currentBPM < targetBPM) {
      console.log('Effect triggered - Low BPM:', currentBPM, 'Target:', targetBPM);
      setShowEffect(true);
      
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
      
      effectTimeoutRef.current = setTimeout(() => {
        setShowEffect(false);
      }, effectType === 'flash' ? FLASH_DURATION : 800);
    }
  };

  useEffect(() => {
    const scheduleNextCheck = () => {
      const interval = getRandomInterval();
      checkIntervalRef.current = setTimeout(() => {
        checkBlinkRate();
        scheduleNextCheck(); // Schedule next check after current check
      }, interval);
    };

    scheduleNextCheck(); // Start the cycle

    return () => {
      if (checkIntervalRef.current) {
        clearTimeout(checkIntervalRef.current);
      }
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, [getCurrentBlinksPerMinute, targetBPM]);

  return {
    showEffect,
    checkBlinkRate
  };
};