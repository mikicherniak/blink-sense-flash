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
      // Ensure WebGL backend is properly initialized
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
      const constraints = {
        video: {
          width: { ideal: 1920 },  // Increased from 640 to 1920 (1080p width)
          height: { ideal: 1080 }, // Increased from 480 to 1080 (1080p height)
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }, // Added max frameRate option
          aspectRatio: 16/9,  // Added to maintain proper aspect ratio
          // Request highest quality available
          advanced: [
            { width: { min: 1280 }, height: { min: 720 } } // Fallback to at least 720p
          ]
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        
        // Log the actual resolution we got
        videoRef.current.onloadedmetadata = () => {
          console.log('Actual video resolution:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          });
        };
        
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