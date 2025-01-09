import React, { useEffect } from 'react';
import { LEFT_EYE, RIGHT_EYE } from '@/utils/blinkDetection';

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
  useEffect(() => {
    const scaleX = canvas.width / videoElement.videoWidth;
    const scaleY = canvas.height / videoElement.videoHeight;

    const transformCoordinate = (point: { x: number; y: number }) => ({
      x: point.x * videoElement.videoWidth * scaleX,
      y: point.y * videoElement.videoHeight * scaleY
    });

    const drawEyeOutline = (indices: number[]) => {
      if (!indices.every(i => landmarks[i])) {
        console.warn('Missing landmarks for eye outline');
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4; // Increased line width
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 2;

      const connectionOrder = [0, 1, 2, 3, 4, 5, 0];
      const firstPoint = transformCoordinate(landmarks[indices[connectionOrder[0]]]);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < connectionOrder.length; i++) {
        const point = transformCoordinate(landmarks[indices[connectionOrder[i]]]);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    };

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmark points
    ctx.fillStyle = '#00FF00';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      if (landmarks[index]) {
        const { x, y } = transformCoordinate(landmarks[index]);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI); // Increased point size
        ctx.fill();
      }
    });

    drawEyeOutline(LEFT_EYE);
    drawEyeOutline(RIGHT_EYE);
  }, [landmarks, canvas, ctx, videoElement]);

  return null;
};