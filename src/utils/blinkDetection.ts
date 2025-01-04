// According to research papers and MediaPipe documentation, typical EAR values:
// - Open eyes: ~0.2-0.3
// - Closed eyes: ~0.05-0.15
export const BLINK_THRESHOLD = 0.2; // If EAR goes below this, consider it a blink
export const BLINK_BUFFER = 0.02;   // Small buffer to prevent rapid state changes
export const MIN_BLINKS_PER_MINUTE = 15;
export const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

// MediaPipe FaceMesh indices for eye contours
// These indices correspond to the actual eye contours in the MediaPipe face mesh model
export const LEFT_EYE = [33, 133, 160, 159, 158, 144]; // Upper and lower eyelid points
export const RIGHT_EYE = [362, 263, 385, 386, 387, 373]; // Upper and lower eyelid points

interface Point {
  x: number;
  y: number;
}

const distance = (p1: Point, p2: Point) => 
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
  const getPoint = (idx: number) => ({
    x: landmarks[idx].x,
    y: landmarks[idx].y
  });
  
  const verticalDist1 = distance(getPoint(eyeIndices[1]), getPoint(eyeIndices[5]));
  const verticalDist2 = distance(getPoint(eyeIndices[2]), getPoint(eyeIndices[4]));
  const horizontalDist = distance(getPoint(eyeIndices[0]), getPoint(eyeIndices[3]));
  
  // EAR = (v1 + v2) / (2 * h), where v1, v2 are vertical distances and h is horizontal distance
  return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
};