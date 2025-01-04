import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface EyeDrawerProps {
  ctx: CanvasRenderingContext2D;
  landmarks: any[];
  canvasWidth: number;
  canvasHeight: number;
  indices: number[];
}

export const drawEyeOutline = ({ ctx, landmarks, canvasWidth, canvasHeight, indices }: EyeDrawerProps) => {
  ctx.beginPath();
  const upperIndices = indices.slice(0, indices.length / 2);
  const lowerIndices = indices.slice(indices.length / 2).reverse();
  
  upperIndices.forEach((index, i) => {
    const point = landmarks[index];
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  
  lowerIndices.forEach((index) => {
    const point = landmarks[index];
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;
    ctx.lineTo(x, y);
  });
  
  ctx.closePath();
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawKeyPoints = ({ ctx, landmarks, canvasWidth, canvasHeight, indices }: EyeDrawerProps) => {
  ctx.fillStyle = '#00FF00';
  indices.forEach(index => {
    const point = landmarks[index];
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
};