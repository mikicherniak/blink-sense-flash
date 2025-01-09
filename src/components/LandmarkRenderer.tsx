import React, { useEffect, useRef } from 'react';
import { LEFT_EYE, RIGHT_EYE } from '@/utils/blinkDetection';

interface LandmarkRendererProps {
  landmarks: any;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  videoElement: HTMLVideoElement;
}

interface Point {
  x: number;
  y: number;
}

export const LandmarkRenderer: React.FC<LandmarkRendererProps> = ({
  landmarks,
  canvas,
  ctx,
  videoElement,
}) => {
  // Keep track of previous positions for smoothing
  const previousPositionsRef = useRef<Point[]>([]);
  
  useEffect(() => {
    const scaleX = canvas.width / videoElement.videoWidth;
    const scaleY = canvas.height / videoElement.videoHeight;

    const smoothPosition = (current: Point, index: number): Point => {
      const SMOOTHING_FACTOR = 0.7; // Adjust this value to control smoothing (0-1)
      
      if (!previousPositionsRef.current[index]) {
        previousPositionsRef.current[index] = current;
        return current;
      }

      const prev = previousPositionsRef.current[index];
      const smoothed = {
        x: prev.x + (current.x - prev.x) * SMOOTHING_FACTOR,
        y: prev.y + (current.y - prev.y) * SMOOTHING_FACTOR
      };

      previousPositionsRef.current[index] = smoothed;
      return smoothed;
    };

    const transformCoordinate = (point: { x: number; y: number }, index: number): Point => {
      const rawPoint = {
        x: point.x * videoElement.videoWidth * scaleX,
        y: point.y * videoElement.videoHeight * scaleY
      };
      return smoothPosition(rawPoint, index);
    };

    const drawEyeOutline = (indices: number[]) => {
      if (!indices.every(i => landmarks[i])) {
        console.warn('Missing landmarks for eye outline');
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2; // Reduced line width
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 1; // Reduced shadow blur

      const connectionOrder = [0, 1, 2, 3, 4, 5, 0];
      const firstPoint = transformCoordinate(landmarks[indices[connectionOrder[0]]], indices[0]);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < connectionOrder.length; i++) {
        const point = transformCoordinate(
          landmarks[indices[connectionOrder[i]]], 
          indices[connectionOrder[i]]
        );
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    };

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmark points
    ctx.fillStyle = '#00FF00';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 1;
    [...LEFT_EYE, ...RIGHT_EYE].forEach((index, arrayIndex) => {
      if (landmarks[index]) {
        const { x, y } = transformCoordinate(landmarks[index], arrayIndex);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI); // Reduced point size
        ctx.fill();
      }
    });

    drawEyeOutline(LEFT_EYE);
    drawEyeOutline(RIGHT_EYE);
  }, [landmarks, canvas, ctx, videoElement]);

  return null;
};
