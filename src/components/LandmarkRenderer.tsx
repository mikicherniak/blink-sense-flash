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

interface PositionHistory {
  positions: Point[];
  lastUpdateTime: number;
}

export const LandmarkRenderer: React.FC<LandmarkRendererProps> = ({
  landmarks,
  canvas,
  ctx,
  videoElement,
}) => {
  // Keep track of position history for each point
  const positionHistoryRef = useRef<Map<number, PositionHistory>>(new Map());
  
  useEffect(() => {
    const scaleX = canvas.width / videoElement.videoWidth;
    const scaleY = canvas.height / videoElement.videoHeight;

    const smoothPosition = (current: Point, index: number): Point => {
      const now = Date.now();
      const HISTORY_SIZE = 10; // Increased history size
      const MAX_HISTORY_AGE = 500; // Maximum age of history entries in ms
      const SMOOTHING_FACTOR = 0.3; // Reduced smoothing factor for more stability
      
      // Initialize history for this point if it doesn't exist
      if (!positionHistoryRef.current.has(index)) {
        positionHistoryRef.current.set(index, {
          positions: [],
          lastUpdateTime: now
        });
      }

      const history = positionHistoryRef.current.get(index)!;
      
      // Remove old entries
      history.positions = history.positions.filter(
        (_, i) => i >= history.positions.length - HISTORY_SIZE
      );

      // Add new position
      history.positions.push(current);
      history.lastUpdateTime = now;

      // If we don't have enough history yet, return current position
      if (history.positions.length < 2) {
        return current;
      }

      // Calculate weighted average of positions
      let weightedX = 0;
      let weightedY = 0;
      let totalWeight = 0;

      for (let i = 0; i < history.positions.length; i++) {
        // More recent positions get higher weights
        const weight = Math.pow(i / history.positions.length, 2);
        weightedX += history.positions[i].x * weight;
        weightedY += history.positions[i].y * weight;
        totalWeight += weight;
      }

      const smoothed = {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight
      };

      // Apply additional smoothing between current and smoothed position
      return {
        x: smoothed.x + (current.x - smoothed.x) * SMOOTHING_FACTOR,
        y: smoothed.y + (current.y - smoothed.y) * SMOOTHING_FACTOR
      };
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
      ctx.lineWidth = 2;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 1;

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
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    drawEyeOutline(LEFT_EYE);
    drawEyeOutline(RIGHT_EYE);
  }, [landmarks, canvas, ctx, videoElement]);

  return null;
};
