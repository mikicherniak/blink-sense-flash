import * as faceMesh from '@mediapipe/face_mesh';

export const createFaceMesh = async () => {
  try {
    const faceMeshInstance = new faceMesh.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    // Initialize WASM module with proper configuration
    await faceMeshInstance.initialize();

    await faceMeshInstance.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      enableFaceGeometry: false // Disable unnecessary features
    });

    return faceMeshInstance;
  } catch (error) {
    console.error('Error creating FaceMesh instance:', error);
    throw error;
  }
};