import React, { useRef, useEffect, useState } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD, BLINK_BUFFER } from '@/utils/blinkDetection';

interface FaceMeshProcessorProps {
  results: any;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onBlink: () => void;
  lastEyeStateRef: React.MutableRefObject<'open' | 'closed'>;
}

const renderLandmarks = (
  landmarks: any,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  videoElement: HTMLVideoElement,
  showX: boolean
) => {
  const scaleX = canvas.width / videoElement.videoWidth;
  const scaleY = canvas.height / videoElement.videoHeight;

  const transformCoordinate = (point: { x: number; y: number }) => {
    return {
      x: point.x * videoElement.videoWidth * scaleX,
      y: point.y * videoElement.videoHeight * scaleY
    };
  };

  if (showX) {
    // Draw X animation for each eye
    const drawX = (eyeIndices: number[]) => {
      if (!eyeIndices.every(i => landmarks[i])) return;

      // Calculate eye center
      const points = eyeIndices.map(i => transformCoordinate(landmarks[i]));
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      
      // Calculate X size based on eye width
      const size = Math.abs(points[0].x - points[2].x) * 0.7;

      ctx.beginPath();
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      
      // Draw X
      ctx.moveTo(centerX - size/2, centerY - size/2);
      ctx.lineTo(centerX + size/2, centerY + size/2);
      ctx.moveTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX - size/2, centerY + size/2);
      ctx.stroke();
    };

    drawX(LEFT_EYE);
    drawX(RIGHT_EYE);
    return;
  }

  // Regular landmark rendering
  ctx.fillStyle = '#00FF00';
  [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
    if (landmarks[index]) {
      const { x, y } = transformCoordinate(landmarks[index]);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  const drawEyeOutline = (indices: number[]) => {
    if (!indices.every(i => landmarks[i])) return;

    ctx.beginPath();
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;

    const connectionOrder = [0, 1, 2, 3, 4, 5, 0];
    const firstPoint = transformCoordinate(landmarks[indices[connectionOrder[0]]]);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < connectionOrder.length; i++) {
      const point = transformCoordinate(landmarks[indices[connectionOrder[i]]]);
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
  };

  drawEyeOutline(LEFT_EYE);
  drawEyeOutline(RIGHT_EYE);
};

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
  const MIN_TIME_BETWEEN_BLINKS = 200; // Reduced minimum time between blinks
  const blinkConfirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showX, setShowX] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const videoElement = document.querySelector('video');
      if (!videoElement) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';
      canvasContextRef.current = canvas.getContext('2d');
    };

    const videoElement = document.querySelector('video');
    if (videoElement) {
      if (videoElement.readyState >= 2) {
        resizeCanvas();
      } else {
        videoElement.addEventListener('loadedmetadata', resizeCanvas);
      }
    }

    return () => {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', resizeCanvas);
      }
      if (blinkConfirmationTimeoutRef.current) {
        clearTimeout(blinkConfirmationTimeoutRef.current);
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const videoElement = document.querySelector('video');
    if (!ctx || !videoElement) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    if (!landmarks) return;
    
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    logIntervalRef.current++;
    if (logIntervalRef.current % 30 === 0) {
      console.log('Current EAR:', {
        left: leftEAR.toFixed(3),
        right: rightEAR.toFixed(3),
        average: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        lastEyeState: lastEyeStateRef.current
      });
    }

    const now = Date.now();
    const timeSinceLastBlink = now - lastBlinkTimeRef.current;

    if (avgEAR < BLINK_THRESHOLD && lastEARRef.current >= BLINK_THRESHOLD) {
      if (lastEyeStateRef.current === 'open' && timeSinceLastBlink >= MIN_TIME_BETWEEN_BLINKS) {
        if (blinkConfirmationTimeoutRef.current) {
          clearTimeout(blinkConfirmationTimeoutRef.current);
        }
        
        blinkConfirmationTimeoutRef.current = setTimeout(() => {
          if (lastEyeStateRef.current === 'closed') {
            console.log('🔍 BLINK DETECTED!', {
              EAR: avgEAR.toFixed(3),
              threshold: BLINK_THRESHOLD,
              previousEAR: lastEARRef.current.toFixed(3),
              timeSinceLastBlink
            });
            lastBlinkTimeRef.current = now;
            setShowX(true);
            setTimeout(() => setShowX(false), 100); // Show X for 100ms
            onBlink();
          }
        }, 50);

        lastEyeStateRef.current = 'closed';
      }
    } else if (avgEAR >= (BLINK_THRESHOLD + BLINK_BUFFER) && lastEyeStateRef.current === 'closed') {
      console.log('👁 Eyes reopened', {
        EAR: avgEAR.toFixed(3),
        threshold: BLINK_THRESHOLD,
        previousEAR: lastEARRef.current.toFixed(3)
      });
      lastEyeStateRef.current = 'open';
    }

    lastEARRef.current = avgEAR;

    renderLandmarks(landmarks, canvas, ctx, videoElement, showX);
  }, [results, canvasRef, onBlink, lastEyeStateRef, showX]);

  return null;
};