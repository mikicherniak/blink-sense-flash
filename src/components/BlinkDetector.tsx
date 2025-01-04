import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Update the models path to ensure it's relative to the public directory
const MODELS_PATH = '/models';
const BLINK_THRESHOLD = 0.5;
const MIN_BLINKS_PER_MINUTE = 15;
const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

export const BlinkDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinksPerMinute, setBlinksPerMinute] = useState(0);
  const lastEyeStateRef = useRef<'open' | 'closed'>('open');
  const { toast } = useToast();
  
  const loadModels = async () => {
    try {
      // Load models in sequence and await each one
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load face detection models. Please ensure models are available.",
        variant: "destructive"
      });
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please ensure camera permissions are granted.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Load models first, then setup camera
    loadModels().then(() => {
      setupCamera();
    });
    
    const blinkInterval = setInterval(() => {
      setBlinksPerMinute(blinkCount);
      setBlinkCount(0);
      
      if (blinksPerMinute < MIN_BLINKS_PER_MINUTE) {
        triggerBlinkReminder();
      }
    }, MEASUREMENT_PERIOD);
    
    return () => clearInterval(blinkInterval);
  }, []);

  const detectBlinks = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      
      const leftEyeAspectRatio = getEyeAspectRatio(leftEye);
      const rightEyeAspectRatio = getEyeAspectRatio(rightEye);
      
      const averageEyeAspectRatio = (leftEyeAspectRatio + rightEyeAspectRatio) / 2;
      
      if (averageEyeAspectRatio < BLINK_THRESHOLD && lastEyeStateRef.current === 'open') {
        lastEyeStateRef.current = 'closed';
        setBlinkCount(prev => prev + 1);
      } else if (averageEyeAspectRatio >= BLINK_THRESHOLD) {
        lastEyeStateRef.current = 'open';
      }
    }

    requestAnimationFrame(detectBlinks);
  };

  const getEyeAspectRatio = (eyePoints: any[]) => {
    const height1 = Math.hypot(
      eyePoints[1].x - eyePoints[5].x,
      eyePoints[1].y - eyePoints[5].y
    );
    const height2 = Math.hypot(
      eyePoints[2].x - eyePoints[4].x,
      eyePoints[2].y - eyePoints[4].y
    );
    const width = Math.hypot(
      eyePoints[0].x - eyePoints[3].x,
      eyePoints[0].y - eyePoints[3].y
    );
    return (height1 + height2) / (2 * width);
  };

  const triggerBlinkReminder = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 flash-overlay z-50';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 200);
    
    toast({
      title: "Blink Reminder",
      description: "Your blink rate is low. Remember to blink more frequently!",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Card className="w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center text-primary">Blink Monitor</h2>
        
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p>Loading face detection models...</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlay={detectBlinks}
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Blinks per minute</span>
            <span className="font-semibold">{blinksPerMinute}</span>
          </div>
          <Progress value={(blinksPerMinute / MIN_BLINKS_PER_MINUTE) * 100} />
          <p className="text-sm text-muted-foreground text-center">
            Recommended: {MIN_BLINKS_PER_MINUTE} blinks per minute
          </p>
        </div>
      </Card>
    </div>
  );
};
