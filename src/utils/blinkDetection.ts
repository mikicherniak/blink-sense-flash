// According to research papers and MediaPipe documentation, typical EAR values:
// - Open eyes: ~0.2-0.3
// - Closed eyes: ~0.05-0.15
// Adjusted thresholds for higher sensitivity
export const BLINK_THRESHOLD = 0.35; // Increased from 0.25 for higher sensitivity
export const BLINK_BUFFER = 0.05;    // Increased buffer for more reliable state changes
export const MIN_BLINKS_PER_MINUTE = 15;
export const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

// MediaPipe FaceMesh indices for eye contours
export const LEFT_EYE = [
  362, // left-most point
  386, // top point
  263, // right-most point
  374, // bottom point
  373, // bottom-left point
  390  // bottom-right point
];

export const RIGHT_EYE = [
  133, // left-most point
  158, // top point
  33,  // right-most point
  153, // bottom point
  144, // bottom-left point
  145  // bottom-right point
];

interface Point {
  x: number;
  y: number;
  z: number;
}

const euclideanDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2) + 
    Math.pow(p2.z - p1.z, 2)
  );
};

// Reduced history size for faster response
const EAR_HISTORY_SIZE = 2;
let earHistory: number[] = [];

export const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
  try {
    // Get the eye corner points
    const corner1 = landmarks[eyeIndices[0]];
    const corner2 = landmarks[eyeIndices[2]];
    
    // Get the top and bottom points
    const top = landmarks[eyeIndices[1]];
    const bottom = landmarks[eyeIndices[3]];
    
    // Get the additional points for better measurement
    const p1 = landmarks[eyeIndices[4]];
    const p2 = landmarks[eyeIndices[5]];
    
    // Validate all points exist
    if (!corner1 || !corner2 || !top || !bottom || !p1 || !p2) {
      console.warn('Missing landmark points for EAR calculation');
      return 1.0;
    }
    
    // Calculate vertical distances with increased weights for better sensitivity
    const v1 = euclideanDistance(p1, p2) * 1.6; // Further increased weight for inner points
    const v2 = euclideanDistance(top, bottom) * 1.5; // Further increased weight for central points
    
    // Calculate horizontal distance with reduced weight
    const h = euclideanDistance(corner1, corner2) * 0.8; // Reduced weight to make ratio more sensitive
    
    // Calculate EAR using the weighted formula
    if (h === 0) return 1.0; // Prevent division by zero
    
    const currentEAR = ((v1 + v2) / 2.0) / h;
    
    // Add to history and maintain fixed size
    earHistory.push(currentEAR);
    if (earHistory.length > EAR_HISTORY_SIZE) {
      earHistory.shift();
    }
    
    // Simple average for more stable results
    const averageEAR = earHistory.reduce((acc, ear) => acc + ear, 0) / earHistory.length;
    
    return averageEAR;
  } catch (error) {
    console.error('Error calculating EAR:', error);
    return 1.0;
  }
};