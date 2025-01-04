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
        const detections = await faceapi
          .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections) {
          return {
            multiFaceLandmarks: [
              detections.landmarks.positions.map(point => ({
                x: point.x / image.width,
                y: point.y / image.height,
                z: 0
              }))
            ]
          };
        }
        return { multiFaceLandmarks: [] };
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