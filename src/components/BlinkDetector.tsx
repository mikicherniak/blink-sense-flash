import React, { useEffect, useState } from 'react';
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkStats } from './BlinkStats';
import { BlinkWarningFlash } from './BlinkWarningFlash';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useWarningFlash, WarningEffect } from '@/hooks/useWarningFlash';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Zap } from 'lucide-react';
import { DotsIcon } from './icons/DotsIcon';

export const BlinkDetector = () => {
  const { isDark, toggleTheme } = useTheme();
  const [warningEffect, setWarningEffect] = useState<WarningEffect>('flash');
  const [targetBPM, setTargetBPM] = useState(15);
  
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
  } = useWarningFlash(getCurrentBlinksPerMinute, monitoringStartTime, warningEffect);

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
      <BlinkWarningFlash isVisible={showWarningFlash} effect={warningEffect} />
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-8">
        <div className={`${isDark ? 'bg-neutral-800/80' : 'bg-background/30'} backdrop-blur-sm rounded-lg p-4 border ${isDark ? 'border-neutral-700/40' : 'border-muted/40'}`}>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className={`text-6xl font-extrabold ${isDark ? 'text-neutral-100' : 'text-foreground'}`}>
                Blin<span className="font-black">X</span>
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>
                Adjusting your blink rate in real-time to prevent eye strain and maintain healthy eyes
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Theme</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-neutral-600 ${
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
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Effect</span>
                <button
                  onClick={() => setWarningEffect(prev => prev === 'flash' ? 'blur' : 'flash')}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-neutral-600 ${
                    warningEffect === 'flash' ? 'bg-neutral-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                      warningEffect === 'flash' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {warningEffect === 'flash' ? (
                      <Zap className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    ) : (
                      <DotsIcon className="w-3.5 h-3.5 text-neutral-600 transition-opacity duration-300 opacity-100" />
                    )}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-foreground'}`}>Target BPM</span>
                <input
                  type="number"
                  value={targetBPM}
                  onChange={(e) => setTargetBPM(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 text-sm rounded border bg-transparent"
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