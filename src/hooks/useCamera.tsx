import { useState, useRef } from 'react';
import { toast } from 'sonner';
import * as tf from '@tensorflow/tfjs-core';
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
        videoRef.current.playsInline = true;
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