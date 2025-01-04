import * as faceapi from 'face-api.js';

export const createFaceMesh = async () => {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    
    const faceMesh = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5
    });

    return {
      send: async ({ image }: { image: HTMLVideoElement }) => {
        try {
          const detections = await faceapi
            .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (detections) {
            console.log('Face detected:', detections.landmarks.positions.length, 'landmarks');
            return {
              multiFaceLandmarks: [
                detections.landmarks.positions.map(point => ({
                  x: point.x / image.videoWidth,
                  y: point.y / image.videoHeight,
                  z: 0
                }))
              ]
            };
          }
          console.log('No face detected');
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