import { Point, ScaleFactors } from '@/types/landmarks';

export const calculateScaleFactors = (
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement
): ScaleFactors => {
  const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
  const canvasAspect = canvas.width / canvas.height;
  
  let scale: number;
  let offsetX = 0;
  let offsetY = 0;
  
  if (videoAspect > canvasAspect) {
    // Video is wider than canvas
    scale = canvas.height / videoElement.videoHeight;
    offsetX = (canvas.width - (videoElement.videoWidth * scale)) / 2;
  } else {
    // Video is taller than canvas
    scale = canvas.width / videoElement.videoWidth;
    offsetY = (canvas.height - (videoElement.videoHeight * scale)) / 2;
  }
  
  return { scaleX: scale, scaleY: scale, offsetX, offsetY };
};

export const transformCoordinate = (
  point: { x: number; y: number },
  videoElement: HTMLVideoElement,
  scaleFactors: ScaleFactors
): Point => {
  const { scaleX, scaleY, offsetX, offsetY } = scaleFactors;
  
  // Convert normalized coordinates (0-1) to actual pixel values
  const rawX = point.x * videoElement.videoWidth;
  const rawY = point.y * videoElement.videoHeight;
  
  return {
    x: (rawX * scaleX) + offsetX,
    y: (rawY * scaleY) + offsetY
  };
};

export const getEyeColor = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
): { r: number; g: number; b: number } => {
  const sampleSize = 5;
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let x = -sampleSize; x <= sampleSize; x++) {
    for (let y = -sampleSize; y <= sampleSize; y++) {
      const pixel = ctx.getImageData(centerX + x, centerY + y, 1, 1).data;
      r += pixel[0];
      g += pixel[1];
      b += pixel[2];
      count++;
    }
  }
  
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
};