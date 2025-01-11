import React, { useEffect, useState } from 'react';
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkStats } from './BlinkStats';
import { BlinkEffect } from './BlinkWarningFlash';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useEffectTrigger, WarningEffect } from '@/hooks/useWarningFlash';
import { useTheme } from '@/hooks/useTheme';
import { Header } from './Header';
import { toast } from 'sonner';

export const BlinkDetector = () => {
  const { isDark, toggleTheme } = useTheme();
  const [effectType, setEffectType] = useState<WarningEffect>('flash');
  const [targetBPM, setTargetBPM] = useState(15);
  const [showPreview, setShowPreview] = useState(false);
  
  const {
    blinksInLastMinute,
    setBlinksInLastMinute,
    monitoringStartTime,
    lastEyeStateRef,
    getCurrentBlinksPerMinute,
    getAverageBlinksPerMinute,
    getSessionDuration,
    handleBlink,
    resetStats
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
    processVideo,
    resetCamera
  } = useCamera();

  const {
    showEffect,
    checkBlinkRate
  } = useEffectTrigger(getCurrentBlinksPerMinute, monitoringStartTime, effectType, targetBPM);

  const handleEffectToggle = () => {
    const newEffect = effectType === 'flash' ? 'blur' : 'flash';
    setEffectType(newEffect);
    setShowPreview(true);
    setTimeout(() => setShowPreview(false), newEffect === 'flash' ? 200 : 1000);
  };

  const handleReset = async () => {
    setIsLoading(true);
    resetStats();
    await resetCamera();
    await setupFaceMesh();
    await setupCamera();
    setIsLoading(false);
    toast.success('Application reset successfully');
  };

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

  return (
    <div className="flex flex-col items-center w-full h-full">
      <BlinkEffect isVisible={showEffect || showPreview} effect={effectType} isDark={isDark} />
      
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 sm:px-8">
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          effectType={effectType}
          handleEffectToggle={handleEffectToggle}
          targetBPM={targetBPM}
          setTargetBPM={setTargetBPM}
          onReset={handleReset}
        />
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