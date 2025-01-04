export const BLINK_THRESHOLD = 0.23; // Adjusted for better sensitivity
export const MIN_BLINKS_PER_MINUTE = 15;
export const MEASUREMENT_PERIOD = 60000; // 1 minute in milliseconds

export const LEFT_EYE = [362, 385, 387, 263, 373, 380];
export const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

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
  
  return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
};