import React, { useRef, useEffect } from 'react';
import { calculateEAR, LEFT_EYE, RIGHT_EYE, BLINK_THRESHOLD, BLINK_BUFFER } from '@/utils/blinkDetection';
import { CanvasManager } from './face/CanvasManager';
import { drawEyeOutline, drawKeyPoints } from './face/EyeDrawer';

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
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

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

    const drawProps = {
      ctx,
      landmarks,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    };

    // Draw eye outlines
    drawEyeOutline({ ...drawProps, indices: LEFT_EYE });
    drawEyeOutline({ ...drawProps, indices: RIGHT_EYE });

    // Draw key points
    drawKeyPoints({ ...drawProps, indices: [...LEFT_EYE, ...RIGHT_EYE] });
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return (
    <CanvasManager 
      canvasRef={canvasRef}
      onContextUpdate={(ctx) => {
        canvasContextRef.current = ctx;
      }}
    />
  );
};