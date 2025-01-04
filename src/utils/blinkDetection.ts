// According to research papers and MediaPipe documentation, typical EAR values:
// - Open eyes: ~0.2-0.3
// - Closed eyes: ~0.05-0.15
export const BLINK_THRESHOLD = 0.2; // If EAR goes below this, consider it a blink
export const BLINK_BUFFER = 0.02;   // Small buffer to prevent rapid state changes
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

export const calculateEAR = (landmarks: any[], eyeIndices: number[]) => {
  // Get the eye corner points
  const corner1 = landmarks[eyeIndices[0]];
  const corner2 = landmarks[eyeIndices[2]];
  
  // Get the top and bottom points
  const top = landmarks[eyeIndices[1]];
  const bottom = landmarks[eyeIndices[3]];
  
  // Get the additional points for better measurement
  const p1 = landmarks[eyeIndices[4]];
  const p2 = landmarks[eyeIndices[5]];
  
  // Calculate vertical distances (average of two measurements)
  const v1 = euclideanDistance(p1, p2);
  const v2 = euclideanDistance(top, bottom);
  
  // Calculate horizontal distance
  const h = euclideanDistance(corner1, corner2);
  
  // Calculate EAR using the formula: EAR = (v1 + v2) / (2 * h)
  if (h === 0) return 1.0; // Prevent division by zero
  
  return (v1 + v2) / (2.0 * h);
};