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

      canvasContextRef.current = canvas.getContext('2d');
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    const videoElement = document.querySelector('video');
    if (videoElement) {
      resizeObserver.observe(videoElement);
    }

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

    logIntervalRef.current++;
    if (logIntervalRef.current % 3 === 0) {
      console.log('Current EAR:', {
        left: leftEAR.toFixed(3),
        right: rightEAR.toFixed(3),
        average: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD
      });
    }

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

    // Draw facial landmarks with adjusted spacing
    ctx.fillStyle = '#00FF00';
    
    // Function to calculate the center point of an eye
    const calculateEyeCenter = (eyeIndices: number[]) => {
      const points = eyeIndices.map(index => ({
        x: landmarks[index].x * canvas.width,
        y: landmarks[index].y * canvas.height
      }));
      
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      
      return { x: centerX, y: centerY };
    };

    // Calculate eye centers
    const leftEyeCenter = calculateEyeCenter(LEFT_EYE);
    const rightEyeCenter = calculateEyeCenter(RIGHT_EYE);

    // Draw eye outlines with adjusted positions
    const drawEyeOutline = (eyeIndices: number[], centerPoint: { x: number, y: number }) => {
      ctx.beginPath();
      
      // Calculate the eye width and height for scaling
      const points = eyeIndices.map(index => ({
        x: landmarks[index].x * canvas.width,
        y: landmarks[index].y * canvas.height
      }));
      
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const eyeWidth = maxX - minX;
      
      // Draw the eye outline with increased size
      const scale = 1.2; // Increase the size of the outline
      
      eyeIndices.forEach((index, i) => {
        const point = landmarks[index];
        const x = centerPoint.x + (point.x * canvas.width - centerPoint.x) * scale;
        const y = centerPoint.y + (point.y * canvas.height - centerPoint.y) * scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw the center point
      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    };

    // Draw the eye outlines
    drawEyeOutline(LEFT_EYE, leftEyeCenter);
    drawEyeOutline(RIGHT_EYE, rightEyeCenter);
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};