import React, { useRef, useEffect } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD } from '@/utils/blinkDetection';

interface FaceMeshProcessorProps {
  results: any;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onBlink: () => void;
  lastEyeStateRef: React.MutableRefObject<'open' | 'closed'>;
}

export const FaceMeshProcessor: React.FC<FaceMeshProcessorProps> = ({
  results,
  canvasRef,
  onBlink,
  lastEyeStateRef
}) => {
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasContextRef.current = canvasRef.current.getContext('2d');
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!ctx) return;

    // Clear canvas only when we have new landmarks
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    
    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    console.log('Average EAR:', avgEAR, 'Threshold:', BLINK_THRESHOLD); // Debug log

    // Detect blink
    if (avgEAR < BLINK_THRESHOLD && lastEyeStateRef.current === 'open') {
      console.log('Blink detected! EAR:', avgEAR); // Debug log
      lastEyeStateRef.current = 'closed';
      onBlink();
    } else if (avgEAR >= BLINK_THRESHOLD && lastEyeStateRef.current === 'closed') {
      lastEyeStateRef.current = 'open';
      console.log('Eyes opened. EAR:', avgEAR); // Debug log
    }

    // Draw facial landmarks for debugging
    ctx.fillStyle = '#00FF00';
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      const point = landmarks[index];
      ctx.beginPath();
      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};