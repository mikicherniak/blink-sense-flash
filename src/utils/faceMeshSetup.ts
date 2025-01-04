import * as faceapi from 'face-api.js';

export const createFaceMesh = async () => {
  try {
    // Load all required models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    
    console.log('Models loaded successfully');

    const faceMesh = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5
    });

    return {
      send: async ({ image }: { image: HTMLVideoElement }) => {
        try {
          if (!image || image.videoWidth === 0) {
            console.log('Video not ready yet');
            return { multiFaceLandmarks: [] };
          }

          console.log('Processing frame:', image.videoWidth, 'x', image.videoHeight);
          
          const detections = await faceapi
            .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (detections) {
            console.log('Face detected:', detections.landmarks.positions.length, 'landmarks');
            const normalizedLandmarks = detections.landmarks.positions.map(point => ({
              x: point.x / image.videoWidth,
              y: point.y / image.videoHeight,
              z: 0
            }));
            
            console.log('First landmark position:', normalizedLandmarks[0]);
            
            return {
              multiFaceLandmarks: [normalizedLandmarks]
            };
          }
          
          console.log('No face detected in this frame');
          return { multiFaceLandmarks: [] };
        } catch (error) {
          console.error('Error processing face:', error);
          return { multiFaceLandmarks: [] };
        }
      },
      onResults: (callback: (results: any) => void) => {
        return callback;
      }
    };
  } catch (error) {
    console.error('Error initializing face detection:', error);
    throw error;
  }
};