import React, { useRef, useEffect } from 'react';
import { LandmarkRenderer } from './LandmarkRenderer';
import { BlinkDetectionProcessor } from './BlinkDetectionProcessor';
import { setupCanvas, initializeCanvas } from '@/utils/canvasUtils';

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
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const videoElement = document.querySelector('video');
      if (!canvas || !videoElement) return;
      setupCanvas(canvas, videoElement, canvasContextRef);
    };

    return initializeCanvas(canvasRef.current, canvasContextRef, resizeCanvas);
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

    return (
      <>
        <BlinkDetectionProcessor
          landmarks={landmarks}
          onBlink={onBlink}
          lastEyeStateRef={lastEyeStateRef}
        />
        <LandmarkRenderer
          landmarks={landmarks}
          canvas={canvas}
          ctx={ctx}
          videoElement={videoElement}
        />
      </>
    );
  }, [results, canvasRef, onBlink, lastEyeStateRef]);

  return null;
};