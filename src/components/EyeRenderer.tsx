import React from 'react';
import { transformCoordinate, getEyeColor } from '@/utils/landmarkUtils';
import { EyeRenderProps } from '@/types/landmarks';

export const EyeRenderer = ({
  indices,
  landmarks,
  ctx,
  videoElement,
  scaleFactors,
  positionHistory
}: EyeRenderProps) => {
  if (!indices.every(i => landmarks[i])) return null;

  const topPoint = transformCoordinate(landmarks[indices[1]], videoElement, scaleFactors);
  const bottomPoint = transformCoordinate(landmarks[indices[3]], videoElement, scaleFactors);
  const leftPoint = transformCoordinate(landmarks[indices[0]], videoElement, scaleFactors);
  const rightPoint = transformCoordinate(landmarks[indices[2]], videoElement, scaleFactors);

  const centerX = (leftPoint.x + rightPoint.x) / 2;
  const centerY = (topPoint.y + bottomPoint.y) / 2;
  const eyeWidth = Math.abs(rightPoint.x - leftPoint.x);
  const eyeHeight = Math.abs(bottomPoint.y - topPoint.y) * 1.2;

  const history = positionHistory.get(indices[0]);
  const now = Date.now();
  const BLINK_ANIMATION_DURATION = 1000;
  
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
    // Sample the eye color from the video feed
    const eyeColor = getEyeColor(ctx, Math.round(centerX), Math.round(centerY));
    const irisColor = `rgb(${eyeColor.r}, ${eyeColor.g}, ${eyeColor.b})`;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Draw eye white
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, eyeWidth/2, eyeHeight/2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw iris using sampled color
    const irisSize = Math.min(eyeWidth, eyeHeight) * 0.4;
    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, irisSize, 0, 2 * Math.PI);
    ctx.fill();

    // Draw highlight
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX + irisSize/4, centerY - irisSize/4, irisSize/4, 0, 2 * Math.PI);
    ctx.fill();
  }

  return null;
};