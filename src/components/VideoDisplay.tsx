import React from 'react';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPlay: () => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export const VideoDisplay = ({ videoRef, canvasRef, onPlay, setIsLoading, isLoading }: VideoDisplayProps) => {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={onPlay}
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <p>Loading face detection models...</p>
        </div>
      )}
    </div>
  );
};