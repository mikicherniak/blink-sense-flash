import React, { useEffect, useRef } from 'react';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPlay: () => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export const VideoDisplay = ({ videoRef, canvasRef, onPlay, setIsLoading, isLoading }: VideoDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!videoRef.current || !canvasRef.current || !containerRef.current) return;
      
      // Get the actual video dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (videoWidth && videoHeight) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    };

    // Update canvas size when video loads
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateCanvasSize);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateCanvasSize);
      }
    };
  }, [videoRef, canvasRef]);

  return (
    <div ref={containerRef} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={onPlay}
        className="w-full h-full object-contain"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
        style={{ objectFit: 'contain' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <p>Loading face detection models...</p>
        </div>
      )}
    </div>
  );
};