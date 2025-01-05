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
  const logIntervalRef = useRef<number>(0);
  const lastBlinkTimeRef = useRef<number>(0);
  const MIN_TIME_BETWEEN_BLINKS = 200; // Minimum 200ms between blinks

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const videoElement = document.querySelector('video');
      if (!videoElement) return;

      canvas.width = videoElement.clientWidth;
      canvas.height = videoElement.clientHeight;
      canvasContextRef.current = canvas.getContext('2d');
    };

    // Create ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(resizeCanvas);
    const videoElement = document.querySelector('video');
    if (videoElement) {
      resizeObserver.observe(videoElement);
    }

    // Initial resize
    resizeCanvas();

    return () => {
      if (videoElement) {
        resizeObserver.unobserve(videoElement);
      }
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    if (!landmarks) return;
    
    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Log EAR values every 100ms to avoid console spam
    logIntervalRef.current++;
    if (logIntervalRef.current % 3 === 0) {
      console.log('Current EAR:', {
        left: leftEAR.toFixed(3),
        right: rightEAR.toFixed(3),
        average: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD
      });
    }

    const now = Date.now();
    const timeSinceLastBlink = now - lastBlinkTimeRef.current;

    // Add hysteresis to prevent rapid state changes
    const isClosing = avgEAR < BLINK_THRESHOLD && lastEARRef.current >= BLINK_THRESHOLD;
    const isOpening = avgEAR >= (BLINK_THRESHOLD + BLINK_BUFFER) && lastEARRef.current < BLINK_THRESHOLD;

    if (isClosing && lastEyeStateRef.current === 'open' && timeSinceLastBlink >= MIN_TIME_BETWEEN_BLINKS) {
      console.log('🔍 BLINK DETECTED!', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3),
        timeSinceLastBlink
      });
      lastEyeStateRef.current = 'closed';
      lastBlinkTimeRef.current = now;
      onBlink();
    } else if (isOpening && lastEyeStateRef.current === 'closed') {
      console.log('👁 Eyes reopened', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3)
      });
      lastEyeStateRef.current = 'open';
    }

    lastEARRef.current = avgEAR;

    // Draw facial landmarks for debugging
    ctx.fillStyle = '#00FF00';
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      if (landmarks[index]) {
        const point = landmarks[index];
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw eye outlines
    const drawEyeOutline = (indices: number[]) => {
      if (!indices.every(i => landmarks[i])) {
        console.warn('Missing landmarks for eye outline');
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;

      // Start with the first point
      const firstPoint = landmarks[indices[0]];
      ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);

      // Connect points in anatomically correct order
      const anatomicalOrder = [0, 1, 2, 3, 4, 5];
      anatomicalOrder.forEach(i => {
        const point = landmarks[indices[i]];
        ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
      });

      // Close the path
      ctx.closePath();
      ctx.stroke();
    };

    drawEyeOutline(LEFT_EYE);
    drawEyeOutline(RIGHT_EYE);
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};