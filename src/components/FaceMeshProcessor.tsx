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

  // Handle canvas setup
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

  // Handle landmark processing and rendering
  useEffect(() => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const videoElement = document.querySelector('video');
    if (!ctx || !videoElement) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    if (!landmarks) return;

    return () => {
      // Cleanup function
    };
  }, [results, canvasRef]);

  if (!results.multiFaceLandmarks?.length) return null;

  const landmarks = results.multiFaceLandmarks[0];
  if (!landmarks) return null;

  return (
    <>
      <BlinkDetectionProcessor
        landmarks={landmarks}
        onBlink={onBlink}
        lastEyeStateRef={lastEyeStateRef}
      />
      {canvasRef.current && canvasContextRef.current && (
        <LandmarkRenderer
          landmarks={landmarks}
          canvas={canvasRef.current}
          ctx={canvasContextRef.current}
          videoElement={document.querySelector('video') as HTMLVideoElement}
        />
      )}
    </>
  );
};