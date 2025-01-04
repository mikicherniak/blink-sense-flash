import React, { useEffect, useRef } from 'react';

interface CanvasManagerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onContextUpdate: (context: CanvasRenderingContext2D) => void;
}

export const CanvasManager: React.FC<CanvasManagerProps> = ({ canvasRef, onContextUpdate }) => {
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      const videoElement = document.querySelector('video');
      if (videoElement) {
        const { clientWidth, clientHeight } = videoElement;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        const context = canvasRef.current.getContext('2d');
        if (context) {
          onContextUpdate(context);
        }
      }
    };

    updateCanvasSize();

    const videoElement = document.querySelector('video');
    if (videoElement) {
      const resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(videoElement);
      return () => resizeObserver.disconnect();
    }
  }, [canvasRef, onContextUpdate]);

  return null;
};