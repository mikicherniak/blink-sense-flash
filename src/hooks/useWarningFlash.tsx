import { useState, useRef, useEffect } from 'react';

const MIN_SESSION_DURATION = 10000;
const FLASH_DURATION = 200; // Increased for better visibility

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
    return Math.floor(Math.random() * 3000) + 3000; // Random between 3-6 seconds
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
      nextCheckIn: getRandomInterval(),
      timestamp: new Date().toISOString()
    });
    
    if (currentBPM < targetBPM && !showEffect) {
      console.log('Effect triggered - Low BPM:', currentBPM, 'Target:', targetBPM);
      setShowEffect(true);
      
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
      
      effectTimeoutRef.current = setTimeout(() => {
        setShowEffect(false);
        console.log('Effect ended');
        
        // Schedule next check immediately after effect ends
        if (checkIntervalRef.current) {
          clearTimeout(checkIntervalRef.current);
        }
        scheduleNextCheck();
      }, effectType === 'flash' ? FLASH_DURATION : 1000);
    }
  };

  const scheduleNextCheck = () => {
    const interval = getRandomInterval();
    console.log('Scheduling next check in:', interval, 'ms');
    checkIntervalRef.current = setTimeout(() => {
      checkBlinkRate();
      scheduleNextCheck();
    }, interval);
  };

  useEffect(() => {
    console.log('Effect trigger initialized');
    scheduleNextCheck();

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