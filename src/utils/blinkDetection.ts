// According to research papers and MediaPipe documentation, typical EAR values:
// - Open eyes: ~0.2-0.3
// - Closed eyes: ~0.05-0.15
// Lowered threshold and buffer for more sensitive detection
export const BLINK_THRESHOLD = 0.215; // Lowered from 0.23 for better sensitivity
export const BLINK_BUFFER = 0.015;    // Reduced buffer for quicker state changes
export const MIN_BLINKS_PER_MINUTE = 15;
export const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

// MediaPipe FaceMesh indices for eye contours
// These indices are for the main eye landmarks in MediaPipe's 468-point model
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

// Increased history size for smoother detection
const EAR_HISTORY_SIZE = 4;
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
    
    // Calculate vertical distances with weighted importance
    const v1 = euclideanDistance(p1, p2) * 1.15; // Give more weight to inner points
    const v2 = euclideanDistance(top, bottom) * 1.1; // Give more weight to central points
    
    // Calculate horizontal distance
    const h = euclideanDistance(corner1, corner2);
    
    // Calculate EAR using the weighted formula
    if (h === 0) return 1.0; // Prevent division by zero
    
    const currentEAR = ((v1 + v2) / 2.0) / h;
    
    // Add to history and maintain fixed size
    earHistory.push(currentEAR);
    if (earHistory.length > EAR_HISTORY_SIZE) {
      earHistory.shift();
    }
    
    // Return weighted moving average (recent values have more weight)
    const weights = [0.1, 0.2, 0.3, 0.4]; // Weights must sum to 1
    const averageEAR = earHistory.reduce((acc, ear, index) => {
      return acc + ear * weights[index];
    }, 0);
    
    return averageEAR;
  } catch (error) {
    console.error('Error calculating EAR:', error);
    return 1.0;
  }
};