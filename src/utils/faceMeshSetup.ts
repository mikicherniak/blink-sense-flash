import { FaceMesh } from '@mediapipe/face_mesh';

export const createFaceMesh = async () => {
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
    }
  });

  // Initialize WASM module with proper configuration
  await faceMesh.initialize();

  await faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    enableFaceGeometry: false // Disable unnecessary features
  });

  return faceMesh;
};