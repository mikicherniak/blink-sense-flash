import React, { useRef } from 'react';

interface VideoDisplayProps {
  onPlay: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const VideoDisplay = ({ onPlay, setIsLoading }: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onPlay={() => {
          setIsLoading(false);
          onPlay();
        }}
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};