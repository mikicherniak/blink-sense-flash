import React, { useRef, useEffect } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD, BLINK_BUFFER } from '@/utils/blinkDetection';

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
  const lastEARRef = useRef<number>(1);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasContextRef.current = canvasRef.current.getContext('2d');
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) {
      console.log('No canvas or landmarks available');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!ctx) {
      console.log('No canvas context');
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    console.log('Got landmarks:', landmarks ? 'yes' : 'no');
    
    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Adjust these thresholds if needed
    const isClosing = avgEAR < BLINK_THRESHOLD && lastEARRef.current >= BLINK_THRESHOLD;
    const isOpening = avgEAR >= BLINK_THRESHOLD && lastEARRef.current < BLINK_THRESHOLD;

    console.log('Current EAR:', avgEAR.toFixed(3), 'Last EAR:', lastEARRef.current.toFixed(3), 'State:', lastEyeStateRef.current);

    if (isClosing && lastEyeStateRef.current === 'open') {
      console.log('BLINK DETECTED! EAR:', avgEAR.toFixed(3));
      lastEyeStateRef.current = 'closed';
      onBlink();
    } else if (isOpening && lastEyeStateRef.current === 'closed') {
      console.log('Eyes reopened. EAR:', avgEAR.toFixed(3));
      lastEyeStateRef.current = 'open';
    }

    lastEARRef.current = avgEAR;

    // Draw facial landmarks using actual pixel coordinates
    ctx.fillStyle = '#00FF00';
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;

    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      const point = landmarks[index];
      if (point) {
        console.log(`Drawing point at ${point.x * canvas.width}, ${point.y * canvas.height}`);
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          2, // Exactly 2px radius
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw lines connecting the eye landmarks
    const drawEyeOutline = (eyeIndices: number[]) => {
      ctx.beginPath();
      eyeIndices.forEach((index, i) => {
        const point = landmarks[index];
        if (point) {
          if (i === 0) {
            ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
          } else {
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
          }
        }
      });
      ctx.closePath();
      ctx.stroke();
    };

    drawEyeOutline(LEFT_EYE);
    drawEyeOutline(RIGHT_EYE);

  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};