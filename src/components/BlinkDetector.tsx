import React, { useEffect } from 'react';
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkWarningFlash } from './BlinkWarningFlash';
import { BlinkStats } from './BlinkStats';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useWarningFlash } from '@/hooks/useWarningFlash';
import { useTheme } from '@/hooks/useTheme';
import { Moon } from 'lucide-react';
import { Switch } from './ui/switch';

export const BlinkDetector = () => {
  const { isDark, toggleTheme } = useTheme();
  
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
        <div className={`${isDark ? 'bg-neutral-800/80' : 'bg-background/30'} backdrop-blur-sm rounded-lg p-4 flex justify-between items-center border ${isDark ? 'border-neutral-700/40' : 'border-muted/40'}`}>
          <h1 className={`text-6xl font-extrabold ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
            Blin<span className="font-black">X</span>
          </h1>
          <div className="flex items-center gap-2">
            <Moon className={`w-5 h-5 ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`} />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-neutral-600"
            />
          </div>
        </div>
      </div>
      
      <BlinkStats 
        currentBPM={getCurrentBlinksPerMinute()}
        averageBPM={getAverageBlinksPerMinute()}
        sessionDuration={getSessionDuration()}
        isDark={isDark}
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
