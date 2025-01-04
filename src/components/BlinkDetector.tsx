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
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinksPerMinute, setBlinksPerMinute] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [faceMeshResults, setFaceMeshResults] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');
  const blinkCountRef = useRef(0); // Add this ref to track blinks between intervals

  const handleBlink = () => {
    blinkCountRef.current += 1;
    setBlinkCount(prev => prev + 1);
    setLastBlinkTime(Date.now());
    console.log('Blink counted! Current count:', blinkCountRef.current);
  };

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
          width: 640,
          height: 480,
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

    const blinkInterval = setInterval(() => {
      console.log('Minute interval - Current blink count:', blinkCountRef.current);
      setBlinksPerMinute(blinkCountRef.current);
      if (blinkCountRef.current < MIN_BLINKS_PER_MINUTE) {
        triggerBlinkReminder();
      }
      blinkCountRef.current = 0; // Reset the count for the next interval
    }, MEASUREMENT_PERIOD);

    return () => {
      clearInterval(blinkInterval);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []); // Remove blinkCount from dependencies

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Card className="w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center text-primary">Blink Monitor</h2>
        
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
        
        <BlinkStats 
          blinksPerMinute={blinksPerMinute}
          minBlinksPerMinute={MIN_BLINKS_PER_MINUTE}
          lastBlinkTime={lastBlinkTime}
        />
      </Card>
    </div>
  );
};