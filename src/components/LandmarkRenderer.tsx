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
  isBlinking: boolean;
  blinkStartTime: number;
}

export const LandmarkRenderer: React.FC<LandmarkRendererProps> = ({
  landmarks,
  canvas,
  ctx,
  videoElement,
}) => {
  const positionHistoryRef = useRef<Map<number, PositionHistory>>(new Map());
  const BLINK_ANIMATION_DURATION = 1000;
  const scaleFactorsRef = useRef({ x: 1, y: 1 });
  
  // Update scale factors whenever canvas or video dimensions change
  useEffect(() => {
    // Calculate scale factors based on the aspect ratio preservation
    const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    if (videoAspect > canvasAspect) {
      // Video is wider than canvas
      const scale = canvas.width / videoElement.videoWidth;
      scaleFactorsRef.current = {
        x: scale,
        y: scale
      };
    } else {
      // Video is taller than canvas
      const scale = canvas.height / videoElement.videoHeight;
      scaleFactorsRef.current = {
        x: scale,
        y: scale
      };
    }
  }, [canvas.width, canvas.height, videoElement.videoWidth, videoElement.videoHeight]);

  useEffect(() => {
    const smoothPosition = (current: Point, index: number): Point => {
      const now = Date.now();
      const HISTORY_SIZE = 10;
      const SMOOTHING_FACTOR = 0.3;
      
      if (!positionHistoryRef.current.has(index)) {
        positionHistoryRef.current.set(index, {
          positions: [],
          lastUpdateTime: now,
          isBlinking: false,
          blinkStartTime: 0
        });
      }

      const history = positionHistoryRef.current.get(index)!;
      history.positions = history.positions.filter(
        (_, i) => i >= history.positions.length - HISTORY_SIZE
      );
      history.positions.push(current);
      history.lastUpdateTime = now;

      if (history.positions.length < 2) return current;

      let weightedX = 0;
      let weightedY = 0;
      let totalWeight = 0;

      for (let i = 0; i < history.positions.length; i++) {
        const weight = Math.pow(i / history.positions.length, 2);
        weightedX += history.positions[i].x * weight;
        weightedY += history.positions[i].y * weight;
        totalWeight += weight;
      }

      const smoothed = {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight
      };

      return {
        x: smoothed.x + (current.x - smoothed.x) * SMOOTHING_FACTOR,
        y: smoothed.y + (current.y - smoothed.y) * SMOOTHING_FACTOR
      };
    };

    const transformCoordinate = (point: { x: number; y: number }, index: number): Point => {
      // Apply scaling while maintaining aspect ratio
      const rawPoint = {
        x: point.x * videoElement.videoWidth * scaleFactorsRef.current.x,
        y: point.y * videoElement.videoHeight * scaleFactorsRef.current.y
      };
      
      // Center the coordinates if there's any offset due to aspect ratio differences
      const xOffset = (canvas.width - (videoElement.videoWidth * scaleFactorsRef.current.x)) / 2;
      const yOffset = (canvas.height - (videoElement.videoHeight * scaleFactorsRef.current.y)) / 2;
      
      rawPoint.x += xOffset;
      rawPoint.y += yOffset;
      
      return smoothPosition(rawPoint, index);
    };

    const drawEye = (indices: number[], isLeft: boolean) => {
      if (!indices.every(i => landmarks[i])) return;

      const topPoint = transformCoordinate(landmarks[indices[1]], indices[1]);
      const bottomPoint = transformCoordinate(landmarks[indices[3]], indices[3]);
      const leftPoint = transformCoordinate(landmarks[indices[0]], indices[0]);
      const rightPoint = transformCoordinate(landmarks[indices[2]], indices[2]);

      const centerX = (leftPoint.x + rightPoint.x) / 2;
      const centerY = (topPoint.y + bottomPoint.y) / 2;
      const eyeWidth = Math.abs(rightPoint.x - leftPoint.x);
      const eyeHeight = Math.abs(bottomPoint.y - topPoint.y) * 1.2;

      const history = positionHistoryRef.current.get(indices[0]);
      const now = Date.now();
      
      const isBlinking = history?.isBlinking && 
                        (now - history.blinkStartTime) < BLINK_ANIMATION_DURATION;

      if (isBlinking) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - eyeWidth/2, centerY - eyeHeight/2);
        ctx.lineTo(centerX + eyeWidth/2, centerY + eyeHeight/2);
        ctx.moveTo(centerX + eyeWidth/2, centerY - eyeHeight/2);
        ctx.lineTo(centerX - eyeWidth/2, centerY + eyeHeight/2);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, eyeWidth/2, eyeHeight/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        const irisSize = Math.min(eyeWidth, eyeHeight) * 0.4;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(centerX, centerY, irisSize, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX + irisSize/4, centerY - irisSize/4, irisSize/4, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const leftEyeHistory = positionHistoryRef.current.get(LEFT_EYE[0]);
    const rightEyeHistory = positionHistoryRef.current.get(RIGHT_EYE[0]);
    
    if (leftEyeHistory && rightEyeHistory) {
      const avgEAR = calculateAverageEAR();
      const now = Date.now();
      
      const CONSECUTIVE_FRAMES_THRESHOLD = 2;
      const MIN_TIME_BETWEEN_BLINKS = 200;
      const timeSinceLastBlink = now - leftEyeHistory.blinkStartTime;
      
      if (avgEAR < 0.45 && !leftEyeHistory.isBlinking && timeSinceLastBlink >= MIN_TIME_BETWEEN_BLINKS) {
        console.log('Starting potential blink animation');
        leftEyeHistory.isBlinking = true;
        rightEyeHistory.isBlinking = true;
        leftEyeHistory.blinkStartTime = now;
        rightEyeHistory.blinkStartTime = now;
      } else if (avgEAR >= 0.45) {
        leftEyeHistory.isBlinking = false;
        rightEyeHistory.isBlinking = false;
      }
    }

    drawEye(LEFT_EYE, true);
    drawEye(RIGHT_EYE, false);
  }, [landmarks, canvas, ctx, videoElement]);

  const calculateAverageEAR = () => {
    const getEyeRatio = (indices: number[]) => {
      const top = landmarks[indices[1]];
      const bottom = landmarks[indices[3]];
      const left = landmarks[indices[0]];
      const right = landmarks[indices[2]];
      
      const height = Math.abs(top.y - bottom.y);
      const width = Math.abs(left.x - right.x);
      
      return height / width;
    };

    const leftEAR = getEyeRatio(LEFT_EYE);
    const rightEAR = getEyeRatio(RIGHT_EYE);
    return (leftEAR + rightEAR) / 2;
  };

  return null;
};
