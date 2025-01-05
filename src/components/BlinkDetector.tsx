import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { VideoDisplay } from './VideoDisplay';
import { createFaceMesh } from '@/utils/faceMeshSetup';
import { FaceMeshProcessor } from './FaceMeshProcessor';
import { MIN_BLINKS_PER_MINUTE, MEASUREMENT_PERIOD } from '@/utils/blinkDetection';
import { triggerBlinkReminder } from './BlinkReminder';
import { toast } from 'sonner';
import { BlinkWarningFlash } from './BlinkWarningFlash';
import { BlinkStats } from './BlinkStats';

const LOW_BPM_THRESHOLD = 20;
const WARNING_DELAY = 10000; // 10 seconds

export const BlinkDetector = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [blinksInLastMinute, setBlinksInLastMinute] = useState<number[]>([]);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [faceMeshResults, setFaceMeshResults] = useState<any>(null);
  const [monitoringStartTime] = useState(Date.now());
  const [totalBlinks, setTotalBlinks] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');
  const lowBpmStartTime = useRef<number | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentBlinksPerMinute = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentBlinks = blinksInLastMinute.filter(time => time > oneMinuteAgo);
    return recentBlinks.length;
  };

  const getAverageBlinksPerMinute = () => {
    const now = Date.now();
    const sessionDurationMinutes = (now - monitoringStartTime) / 60000;
    
    // For the first minute, return the current BPM
    if (sessionDurationMinutes <= 1) {
      return getCurrentBlinksPerMinute();
    }
    
    // After the first minute, calculate the true average
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
    const currentAverage = getAverageBlinksPerMinute();
    
    if (currentAverage < LOW_BPM_THRESHOLD) {
      if (!lowBpmStartTime.current) {
        lowBpmStartTime.current = now;
      } else if (now - lowBpmStartTime.current >= WARNING_DELAY) {
        setShowWarningFlash(true);
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarningFlash(false);
        }, 1000);
      }
    } else {
      lowBpmStartTime.current = null;
      setShowWarningFlash(false);
    }
    
    // Original blink reminder check
    const monitoringDuration = now - monitoringStartTime;
    if (monitoringDuration >= 60000 && getCurrentBlinksPerMinute() < MIN_BLINKS_PER_MINUTE) {
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
      console.log('TensorFlow backend ready:', tf.getBackend());
      
      faceMeshRef.current = await createFaceMesh();
      console.log('FaceMesh created successfully');
      
      if (faceMeshRef.current) {
        faceMeshRef.current.onResults((results: any) => {
          setFaceMeshResults(results);
        });
      }
    } catch (error) {
      console.error('Error setting up FaceMesh:', error);
      setCameraError('Failed to initialize face detection');
      setIsLoading(false);
    }
  };

  const setupCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true; // Important for iOS
        await videoRef.current.play();
        console.log('Video element playing');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsLoading(false);
      toast.error('Camera access failed. Please check permissions.');
    }
  };

  const processVideo = async () => {
    if (!videoRef.current || !faceMeshRef.current) return;
    
    try {
      if (videoRef.current.videoWidth > 0) {
        await faceMeshRef.current.send({ image: videoRef.current });
      }
      requestAnimationFrame(processVideo);
    } catch (error) {
      console.error('Error processing video frame:', error);
    }
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