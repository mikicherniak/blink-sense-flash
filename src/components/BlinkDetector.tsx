import React, { useEffect } from 'react';
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkWarningFlash } from './BlinkWarningFlash';
import { BlinkStats } from './BlinkStats';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useWarningFlash } from '@/hooks/useWarningFlash';

export const BlinkDetector = () => {
  const {
    blinksInLastMinute,
    setBlinksInLastMinute,
    monitoringStartTime,
    lastEyeStateRef,
    getCurrentBlinksPerMinute,
    getAverageBlinksPerMinute,
    getSessionDuration,
    handleBlink
  } = useBlinkTracking();

  const {
    isLoading,
    setIsLoading,
    cameraError,
    faceMeshResults,
    videoRef,
    canvasRef,
    setupFaceMesh,
    setupCamera,
    processVideo
  } = useCamera();

  const {
    showWarningFlash,
    checkBlinkRate
  } = useWarningFlash(getCurrentBlinksPerMinute, monitoringStartTime);

  useEffect(() => {
    const init = async () => {
      await setupFaceMesh();
      await setupCamera();
      setIsLoading(false);
    };
    
    init();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      setBlinksInLastMinute(prev => prev.filter(time => time > oneMinuteAgo));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(checkBlinkRate, 10000);
    return () => clearInterval(checkInterval);
  }, [blinksInLastMinute]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <BlinkWarningFlash isVisible={showWarningFlash} />
      
      {cameraError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          {cameraError}
        </div>
      )}
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-8">
        <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex justify-center border border-muted/40">
          <h1 className="text-6xl font-extrabold text-neutral-800">Blin<span className="font-black">X</span></h1>
        </div>
      </div>
      
      <BlinkStats 
        currentBPM={getCurrentBlinksPerMinute()}
        averageBPM={getAverageBlinksPerMinute()}
        sessionDuration={getSessionDuration()}
      />
      
      <VideoDisplay 
        videoRef={videoRef}
        canvasRef={canvasRef}
        onPlay={() => {
          processVideo();
        }}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />
      
      {faceMeshResults && (
        <FaceMeshProcessor
          results={faceMeshResults}
          canvasRef={canvasRef}
          onBlink={handleBlink}
          lastEyeStateRef={lastEyeStateRef}
        />
      )}
    </div>
  );
};