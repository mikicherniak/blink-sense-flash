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
    
    // Get the canvas context
    canvasContextRef.current = canvasRef.current.getContext('2d');
    
    // Set canvas size to match video dimensions
    const videoElement = document.querySelector('video');
    if (videoElement) {
      canvasRef.current.width = videoElement.clientWidth;
      canvasRef.current.height = videoElement.clientHeight;
    }
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    
    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Add hysteresis to prevent rapid state changes
    const isClosing = avgEAR < BLINK_THRESHOLD && lastEARRef.current >= BLINK_THRESHOLD;
    const isOpening = avgEAR >= (BLINK_THRESHOLD + BLINK_BUFFER) && lastEARRef.current < BLINK_THRESHOLD;

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

    // Draw facial landmarks for debugging
    ctx.fillStyle = '#00FF00';
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      const point = landmarks[index];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw simplified eye outlines (only the outer edges)
    const drawSimplifiedEyeOutline = (indices: number[]) => {
      ctx.beginPath();
      // Only draw the outer edge of the eye
      const upperIndices = indices.slice(0, indices.length / 2);
      const lowerIndices = indices.slice(indices.length / 2).reverse();
      
      // Draw upper lid
      upperIndices.forEach((index, i) => {
        const point = landmarks[index];
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      // Draw lower lid
      lowerIndices.forEach((index) => {
        const point = landmarks[index];
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        ctx.lineTo(x, y);
      });
      
      ctx.closePath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawSimplifiedEyeOutline(LEFT_EYE);
    drawSimplifiedEyeOutline(RIGHT_EYE);
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};