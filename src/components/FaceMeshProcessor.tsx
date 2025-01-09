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
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Get and store the canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvasContextRef.current = ctx;
    };

    // Initial setup
    resizeCanvas();

    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef]);

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