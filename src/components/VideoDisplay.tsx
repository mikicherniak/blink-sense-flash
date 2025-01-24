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
    <div className="fixed inset-0 -z-10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={onPlay}
        className="w-full h-full object-cover [transform:rotateY(180deg)]"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full [transform:rotateY(180deg)]" 
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          Loading...
        </div>
      )}
    </div>
  );
};