export const BLINK_THRESHOLD = 0.25; // Lower threshold for face-api.js EAR calculations
export const BLINK_BUFFER = 0.02; // Small buffer for state changes
export const MIN_BLINKS_PER_MINUTE = 15;
export const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

// MediaPipe FaceMesh indices for eye contours
// These indices correspond to the face-api.js landmark indices
export const LEFT_EYE = [36, 37, 38, 39, 40, 41]; // face-api.js left eye points
export const RIGHT_EYE = [42, 43, 44, 45, 46, 47]; // face-api.js right eye points

interface Point {
  x: number;
  y: number;
}

const distance = (p1: Point, p2: Point) => 
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
  const points = eyeIndices.map(index => landmarks[index]);
  
  // Vertical distances
  const verticalDist1 = distance(points[1], points[5]);
  const verticalDist2 = distance(points[2], points[4]);
  
  // Horizontal distance
  const horizontalDist = distance(points[0], points[3]);
  
  // Calculate EAR
  return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
};