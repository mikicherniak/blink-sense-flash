import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Card } from '@/components/ui/card';
import { VideoDisplay } from './VideoDisplay';
import { BlinkStats } from './BlinkStats';
import { createFaceMesh } from '@/utils/faceMeshSetup';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { MIN_BLINKS_PER_MINUTE, MEASUREMENT_PERIOD } from '@/utils/blinkDetection';
import { triggerBlinkReminder } from './BlinkReminder';

export const BlinkDetector = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [blinksInLastMinute, setBlinksInLastMinute] = useState<number[]>([]);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [faceMeshResults, setFaceMeshResults] = useState<any>(null);
  const [monitoringStartTime] = useState(Date.now());
  const [totalBlinks, setTotalBlinks] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');
  const lastCheckTime = useRef(Date.now());

  const getCurrentBlinksPerMinute = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentBlinks = blinksInLastMinute.filter(time => time > oneMinuteAgo);
    return recentBlinks.length;
  };

  const getAverageBlinksPerMinute = () => {
    const sessionDurationMinutes = (Date.now() - monitoringStartTime) / 60000;
    return sessionDurationMinutes > 0 ? Math.round((totalBlinks / sessionDurationMinutes) * 10) / 10 : 0;
  };

  const getSessionDuration = () => {
    const durationMs = Date.now() - monitoringStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const checkBlinkRate = () => {
    const now = Date.now();
    const monitoringDuration = now - monitoringStartTime;
    
    // Only check blink rate after the first minute
    if (monitoringDuration < 60000) {
      return;
    }
    
    const currentRate = getCurrentBlinksPerMinute();
    if (currentRate < MIN_BLINKS_PER_MINUTE) {
      triggerBlinkReminder();
    }
  };

  const handleBlink = () => {
    const now = Date.now();
    setBlinksInLastMinute(prev => [...prev, now]);
    setLastBlinkTime(now);
    setTotalBlinks(prev => prev + 1);
  };

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      setBlinksInLastMinute(prev => prev.filter(time => time > oneMinuteAgo));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const setupFaceMesh = async () => {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      faceMeshRef.current = await createFaceMesh();
      
      if (faceMeshRef.current) {
        faceMeshRef.current.onResults((results: any) => {
          setFaceMeshResults(results);
        });
      }
    } catch (error) {
      console.error('Error setting up FaceMesh:', error);
      setIsLoading(false);
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const processVideo = async () => {
    if (!videoRef.current || !faceMeshRef.current) return;
    
    if (videoRef.current.videoWidth > 0) {
      await faceMeshRef.current.send({ image: videoRef.current });
    }
    
    requestAnimationFrame(processVideo);
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
    // Check blink rate every 10 seconds after the first minute
    const checkInterval = setInterval(checkBlinkRate, 10000);
    return () => clearInterval(checkInterval);
  }, [blinksInLastMinute]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-8">
        <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex justify-center border border-muted/40">
          <h1 className="text-6xl font-extrabold text-neutral-800">BlinX</h1>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-10 w-full max-w-4xl px-8">
        <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
          <span className="text-sm text-neutral-500">Current BPM</span>
          <div className="text-2xl font-bold text-neutral-700">{getCurrentBlinksPerMinute()}</div>
        </div>
        <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
          <span className="text-sm text-neutral-500">Average BPM</span>
          <div className="text-2xl font-bold text-neutral-700">{getAverageBlinksPerMinute()}</div>
        </div>
        <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 flex-1 border border-muted/40">
          <span className="text-sm text-neutral-500">Session Duration</span>
          <div className="text-2xl font-bold text-neutral-700">{getSessionDuration()}</div>
        </div>
      </div>
      
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
