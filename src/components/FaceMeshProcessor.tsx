import React, { useRef, useEffect } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD, BLINK_BUFFER } from '@/utils/blinkDetection';

interface FaceMeshProcessorProps {
  results: any;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onBlink: () => void;
  lastEyeStateRef: React.MutableRefObject<'open' | 'closed'>;
}

// Separate the landmark drawing logic into a dedicated component
const LandmarkRenderer: React.FC<{
  landmarks: any;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  videoElement: HTMLVideoElement;
}> = ({ landmarks, canvas, ctx, videoElement }) => {
  // Calculate scaling factors based on video and canvas dimensions
  const scaleX = canvas.width / videoElement.videoWidth;
  const scaleY = canvas.height / videoElement.videoHeight;

  // Transform landmark coordinates to canvas space
  const transformCoordinate = (point: { x: number; y: number }) => {
    return {
      x: point.x * videoElement.videoWidth * scaleX,
      y: point.y * videoElement.videoHeight * scaleY
    };
  };

  // Draw landmarks
  ctx.fillStyle = '#00FF00';
  [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
    if (landmarks[index]) {
      const { x, y } = transformCoordinate(landmarks[index]);
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

    // Define anatomically correct connection order
    const connectionOrder = [0, 1, 2, 3, 4, 5, 0];
    
    // Start with the first point
    const firstPoint = transformCoordinate(landmarks[indices[connectionOrder[0]]]);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    // Connect points following the anatomical order
    for (let i = 1; i < connectionOrder.length; i++) {
      const point = transformCoordinate(landmarks[indices[connectionOrder[i]]]);
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
  };

  drawEyeOutline(LEFT_EYE);
  drawEyeOutline(RIGHT_EYE);

  // React components must return something
  return null;
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
  const MIN_TIME_BETWEEN_BLINKS = 200;

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const videoElement = document.querySelector('video');
      if (!videoElement) return;

      // Match canvas size to video dimensions exactly
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Scale the canvas display size using CSS to match container
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';

      // Update the canvas context
      canvasContextRef.current = canvas.getContext('2d');
    };

    const videoElement = document.querySelector('video');
    if (videoElement) {
      // Wait for video metadata to be loaded before initial resize
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

    // Render landmarks using the dedicated component
    return <LandmarkRenderer
      landmarks={landmarks}
      canvas={canvas}
      ctx={ctx}
      videoElement={videoElement}
    />;
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};