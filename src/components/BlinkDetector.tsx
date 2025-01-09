import React, { useEffect, useState } from 'react';
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkStats } from './BlinkStats';
import { BlinkEffect } from './BlinkWarningFlash';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useEffectTrigger, WarningEffect } from '@/hooks/useWarningFlash';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Zap } from 'lucide-react';
import { DotsIcon } from './icons/DotsIcon';

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
    showEffect,
    checkBlinkRate
  } = useEffectTrigger(getCurrentBlinksPerMinute, monitoringStartTime, effectType, targetBPM);

  const handleEffectToggle = () => {
    const newEffect = effectType === 'flash' ? 'blur' : 'flash';
    setEffectType(newEffect);
    setShowPreview(true);
    setTimeout(() => setShowPreview(false), newEffect === 'flash' ? 200 : 1000);
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

  // Effect for low BPM check
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkBlinkRate();
    }, 10000);
    return () => clearInterval(checkInterval);
  }, [blinksInLastMinute, targetBPM]);

  // Effect for very low BPM check
  useEffect(() => {
    const criticalCheckInterval = setInterval(() => {
      checkBlinkRate();
    }, 5000);

    return () => clearInterval(criticalCheckInterval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <BlinkEffect isVisible={showEffect || showPreview} effect={effectType} />
      
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 sm:px-8">
        <div className={`${isDark ? 'bg-neutral-800/80' : 'bg-background/30'} backdrop-blur-sm rounded-lg p-4 border ${isDark ? 'border-neutral-700/40' : 'border-muted/40'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className={`text-4xl sm:text-6xl font-extrabold ${isDark ? 'text-neutral-100' : 'text-foreground'}`}>
                  Blin<span className="font-black">X</span>
                </h1>
                <p className={`text-[10px] sm:text-xs leading-tight max-w-[100px] ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>
                  Adjusting your blink rate in real-time to protect your eyes
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 min-w-[200px]">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Theme</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                    isDark ? 'bg-neutral-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    )}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Effect</span>
                <button
                  onClick={handleEffectToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                    effectType === 'flash' ? 'bg-neutral-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                      effectType === 'flash' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {effectType === 'flash' ? (
                      <Zap className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    ) : (
                      <DotsIcon className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    )}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Target BPM</span>
                <input
                  type="number"
                  value={targetBPM}
                  onChange={(e) => setTargetBPM(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-[44px] h-6 px-2 text-xs rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'text-neutral-400 bg-neutral-600' : 'text-foreground bg-neutral-300'
                  }`}
                  min="1"
                  max="60"
                />
              </div>
            </div>
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