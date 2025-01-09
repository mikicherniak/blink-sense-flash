export const setupCanvas = (
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  canvasContextRef: React.MutableRefObject<CanvasRenderingContext2D | null>
) => {
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.objectFit = 'cover';
  canvasContextRef.current = canvas.getContext('2d');
};

export const initializeCanvas = (
  canvas: HTMLCanvasElement | null,
  canvasContextRef: React.MutableRefObject<CanvasRenderingContext2D | null>,
  callback: () => void
) => {
  if (!canvas) return;

  const videoElement = document.querySelector('video');
  if (!videoElement) return;

  if (videoElement.readyState >= 2) {
    callback();
  } else {
    videoElement.addEventListener('loadedmetadata', callback);
  }

  return () => {
    videoElement.removeEventListener('loadedmetadata', callback);
  };
};