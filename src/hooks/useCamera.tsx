import { useState, useRef } from 'react';
import { toast } from 'sonner';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { createFaceMesh } from '@/utils/faceMeshSetup';

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceMeshResults, setFaceMeshResults] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);

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
      toast.error('Face detection initialization failed. Please try refreshing the page.');
    }
  };

  const setupCamera = async () => {
    try {
      // Improved camera constraints for better face detection
      const constraints = {
        video: {
          width: { ideal: 1280 }, // Increased resolution
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 60, min: 30 }, // Higher frame rate
          // Additional camera settings for better quality
          brightness: { ideal: 100 },
          contrast: { ideal: 100 },
          exposureMode: 'continuous',
          focusMode: 'continuous',
          whiteBalanceMode: 'continuous'
        } as MediaTrackConstraints
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        
        // Wait for video to be properly initialized
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadeddata = resolve;
          }
        });
        
        await videoRef.current.play();
        
        // Log the actual frame rate we got
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log('Actual camera settings:', settings);
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

  return {
    isLoading,
    setIsLoading,
    cameraError,
    faceMeshResults,
    videoRef,
    canvasRef,
    faceMeshRef,
    setupFaceMesh,
    setupCamera,
    processVideo
  };
};