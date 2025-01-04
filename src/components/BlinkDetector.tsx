import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Card } from '@/components/ui/card';
import { VideoDisplay } from './VideoDisplay';
import { BlinkStats } from './BlinkStats';

const MODELS_PATH = '/models';
const BLINK_THRESHOLD = 0.5;
const MIN_BLINKS_PER_MINUTE = 15;
const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

export const BlinkDetector = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinksPerMinute, setBlinksPerMinute] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');
  const modelsLoadedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH)
      ]);
      modelsLoadedRef.current = true;
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
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
        console.log('Camera setup successful');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const drawFaceLandmarks = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoadedRef.current) {
      console.log('Video, canvas, or models not ready');
      return;
    }

    const canvas = canvasRef.current;
    const displaySize = { 
      width: videoRef.current.videoWidth, 
      height: videoRef.current.videoHeight 
    };

    // Match canvas size to video size
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
      faceapi.matchDimensions(canvas, displaySize);
    }

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      console.log('Face detected!');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the detection results
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        // Draw face landmarks
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
        
        // Specifically highlight the eyes
        const landmarks = resizedDetection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        
        // Draw circles around eyes
        ctx.beginPath();
        ctx.arc(leftEye[0].x, leftEye[0].y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEye[0].x, rightEye[0].y, 3, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } else {
      console.log('No face detected');
      // Clear canvas when no face is detected
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(drawFaceLandmarks);
  };

  useEffect(() => {
    loadModels();
    setupCamera();
    
    const blinkInterval = setInterval(() => {
      setBlinksPerMinute(blinkCount);
      console.log('Current blink count:', blinkCount);
      
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
            setIsLoading(false);
            drawFaceLandmarks();
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