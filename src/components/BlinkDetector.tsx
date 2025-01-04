import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Card } from '@/components/ui/card';
import { VideoDisplay } from './VideoDisplay';
import { BlinkStats } from './BlinkStats';
import { createFaceMesh } from '@/utils/faceMeshSetup';

const MIN_BLINKS_PER_MINUTE = 15;
const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds
const BLINK_THRESHOLD = 0.2;
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

export const BlinkDetector = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinksPerMinute, setBlinksPerMinute] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');

  const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
    const getPoint = (idx: number) => ({
      x: landmarks[idx].x,
      y: landmarks[idx].y
    });
    
    const distance = (p1: any, p2: any) => 
      Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    const verticalDist1 = distance(getPoint(eyeIndices[1]), getPoint(eyeIndices[5]));
    const verticalDist2 = distance(getPoint(eyeIndices[2]), getPoint(eyeIndices[4]));
    const horizontalDist = distance(getPoint(eyeIndices[0]), getPoint(eyeIndices[3]));
    
    return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !results.multiFaceLandmarks?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.multiFaceLandmarks[0];
    
    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Detect blink
    if (avgEAR < BLINK_THRESHOLD && lastEyeStateRef.current === 'open') {
      lastEyeStateRef.current = 'closed';
      setBlinkCount(prev => prev + 1);
      setLastBlinkTime(Date.now());
    } else if (avgEAR >= BLINK_THRESHOLD && lastEyeStateRef.current === 'closed') {
      lastEyeStateRef.current = 'open';
    }

    // Draw facial landmarks
    ctx.fillStyle = '#00FF00';
    [...LEFT_EYE, ...RIGHT_EYE].forEach(index => {
      ctx.beginPath();
      ctx.arc(
        landmarks[index].x * canvas.width,
        landmarks[index].y * canvas.height,
        2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  };

  const setupFaceMesh = async () => {
    try {
      await tf.setBackend('webgl');
      faceMeshRef.current = await createFaceMesh();
      faceMeshRef.current.onResults(onResults);
    } catch (error) {
      console.error('Error setting up FaceMesh:', error);
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
      setBlinksPerMinute(blinkCount);
      if (blinkCount < MIN_BLINKS_PER_MINUTE) {
        triggerBlinkReminder();
      }
      setBlinkCount(0);
    }, MEASUREMENT_PERIOD);

    return () => {
      clearInterval(blinkInterval);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [blinkCount]);

  const triggerBlinkReminder = () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '9999';
    overlay.style.animation = 'flash 0.2s ease-out forwards';
    
    const keyframes = `
      @keyframes flash {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    }, 200);
  };

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
        
        <BlinkStats 
          blinksPerMinute={blinksPerMinute}
          minBlinksPerMinute={MIN_BLINKS_PER_MINUTE}
          lastBlinkTime={lastBlinkTime}
        />
      </Card>
    </div>
  );
};