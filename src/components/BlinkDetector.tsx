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

  const checkBlinkRate = () => {
    const currentRate = getCurrentBlinksPerMinute();
    if (currentRate < MIN_BLINKS_PER_MINUTE) {
      triggerBlinkReminder();
    }
  };

  const handleBlink = () => {
    const now = Date.now();
    setBlinksInLastMinute(prev => [...prev, now]);
    setLastBlinkTime(now);
    checkBlinkRate();
  };

  // Clean up old blink timestamps periodically
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
          facingMode: 'user',
          // Add advanced constraints for zoom
          advanced: [
            {
              zoom: 2.0 // Zoom level (2x zoom)
            },
            {
              // Optimize for face detection
              exposureMode: 'continuous',
              focusMode: 'continuous',
              whiteBalanceMode: 'continuous'
            }
          ]
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Get video track to apply constraints
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        // Apply zoom if supported
        if (capabilities.zoom) {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: 2.0 }]
          });
        }
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

  // Check blink rate every second
  useEffect(() => {
    const checkInterval = setInterval(checkBlinkRate, 1000);
    return () => clearInterval(checkInterval);
  }, [blinksInLastMinute]);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Card className="w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center text-primary">Blink Monitor</h2>
        
        <div className="absolute top-4 right-4 bg-primary/10 rounded-lg p-3">
          <span className="text-lg font-bold">{getCurrentBlinksPerMinute()}</span>
          <span className="text-sm ml-2">blinks/min</span>
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
      </Card>
    </div>
  );
};