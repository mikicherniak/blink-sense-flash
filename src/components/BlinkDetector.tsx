import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { VideoDisplay } from './VideoDisplay';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { BlinkStats } from './BlinkStats';
import { useBlinkTracking } from '@/hooks/useBlinkTracking';
import { useCamera } from '@/hooks/useCamera';
import { useWarningFlash } from '@/hooks/useWarningFlash';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { BlinkWarningFlash } from './BlinkWarningFlash';
import { useToast } from '@/hooks/use-toast';

export const BlinkDetector = () => {
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  
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
    const checkInterval = setInterval(() => {
      const currentBPM = getCurrentBlinksPerMinute();
      if (currentBPM < 12) {
        toast({
          title: "⚠️ Low Blink Rate Alert!",
          description: "Your blink rate is below recommended levels. Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.",
          variant: "destructive",
          duration: 5000,
        });
      }
      checkBlinkRate();
    }, 10000);
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