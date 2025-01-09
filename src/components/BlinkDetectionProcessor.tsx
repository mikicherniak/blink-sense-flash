import React, { useRef } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD, BLINK_BUFFER } from '@/utils/blinkDetection';

interface BlinkDetectionProcessorProps {
  landmarks: any;
  onBlink: () => void;
  lastEyeStateRef: React.MutableRefObject<'open' | 'closed'>;
}

export const BlinkDetectionProcessor: React.FC<BlinkDetectionProcessorProps> = ({
  landmarks,
  onBlink,
  lastEyeStateRef,
}) => {
  const lastEARRef = useRef<number>(1);
  const logIntervalRef = useRef<number>(0);
  const lastBlinkTimeRef = useRef<number>(0);
  const consecutiveFramesRef = useRef<number>(0);
  
  const MIN_TIME_BETWEEN_BLINKS = 200;
  const CONSECUTIVE_FRAMES_THRESHOLD = 2;

  const processBlinkDetection = () => {
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    logIntervalRef.current++;
    if (logIntervalRef.current % 3 === 0) {
      console.log('Current EAR:', {
        left: leftEAR.toFixed(3),
        right: rightEAR.toFixed(3),
        average: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        lastEyeState: lastEyeStateRef.current,
        consecutiveFrames: consecutiveFramesRef.current
      });
    }

    const now = Date.now();
    const timeSinceLastBlink = now - lastBlinkTimeRef.current;

    if (avgEAR < BLINK_THRESHOLD) {
      consecutiveFramesRef.current++;
    } else {
      consecutiveFramesRef.current = 0;
    }

    if (consecutiveFramesRef.current >= CONSECUTIVE_FRAMES_THRESHOLD && 
        lastEyeStateRef.current === 'open' && 
        timeSinceLastBlink >= MIN_TIME_BETWEEN_BLINKS) {
      console.log('🔍 BLINK DETECTED!', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3),
        timeSinceLastBlink,
        consecutiveFrames: consecutiveFramesRef.current
      });
      lastEyeStateRef.current = 'closed';
      lastBlinkTimeRef.current = now;
      onBlink();
      consecutiveFramesRef.current = 0;
    } else if (avgEAR >= (BLINK_THRESHOLD + BLINK_BUFFER) && lastEyeStateRef.current === 'closed') {
      console.log('👁 Eyes reopened', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3),
        consecutiveFrames: consecutiveFramesRef.current
      });
      lastEyeStateRef.current = 'open';
    }

    lastEARRef.current = avgEAR;
  };

  processBlinkDetection();
  return null;
};