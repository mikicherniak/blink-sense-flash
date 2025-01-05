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

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const videoElement = document.querySelector('video');
      if (!videoElement) return;

      canvas.width = videoElement.clientWidth;
      canvas.height = videoElement.clientHeight;

      // Update the canvas context
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

    // Add hysteresis to prevent rapid state changes
    const isClosing = avgEAR < BLINK_THRESHOLD && lastEARRef.current >= BLINK_THRESHOLD;
    const isOpening = avgEAR >= (BLINK_THRESHOLD + BLINK_BUFFER) && lastEARRef.current < BLINK_THRESHOLD;

    if (isClosing && lastEyeStateRef.current === 'open') {
      console.log('🔍 BLINK DETECTED!', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3)
      });
      lastEyeStateRef.current = 'closed';
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

    // Get the video element for scaling calculations
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    // Calculate scale factors based on the video's natural dimensions and display size
    const scaleX = canvas.width / videoElement.videoWidth;
    const scaleY = canvas.height / videoElement.videoHeight;

    // Draw facial landmarks for debugging
    ctx.fillStyle = '#00FF00';
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      const point = landmarks[index];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw simplified eye outlines
    const drawSimplifiedEyeOutline = (indices: number[]) => {
      ctx.beginPath();
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
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawSimplifiedEyeOutline(LEFT_EYE);
    drawSimplifiedEyeOutline(RIGHT_EYE);
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};