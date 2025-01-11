import React, { useEffect, useRef } from 'react';
import { LEFT_EYE, RIGHT_EYE } from '@/utils/blinkDetection';
import { calculateScaleFactors } from '@/utils/landmarkUtils';
import { EyeRenderer } from './EyeRenderer';
import { PositionHistory } from '@/types/landmarks';

interface LandmarkRendererProps {
  landmarks: any;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  videoElement: HTMLVideoElement;
}

export const LandmarkRenderer: React.FC<LandmarkRendererProps> = ({
  landmarks,
  canvas,
  ctx,
  videoElement,
}) => {
  const positionHistoryRef = useRef<Map<number, PositionHistory>>(new Map());
  const scaleFactorsRef = useRef(calculateScaleFactors(videoElement, canvas));

  useEffect(() => {
    scaleFactorsRef.current = calculateScaleFactors(videoElement, canvas);
  }, [canvas.width, canvas.height, videoElement.videoWidth, videoElement.videoHeight]);

  useEffect(() => {
    if (!landmarks || !canvas || !ctx || !videoElement) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get video frame data for color sampling
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Draw eyes
    const eyeProps = {
      ctx,
      landmarks,
      videoElement,
      scaleFactors: scaleFactorsRef.current,
      positionHistory: positionHistoryRef.current
    };

    EyeRenderer({ ...eyeProps, indices: LEFT_EYE });
    EyeRenderer({ ...eyeProps, indices: RIGHT_EYE });

  }, [landmarks, canvas, ctx, videoElement]);

  return null;
};