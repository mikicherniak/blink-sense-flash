export interface Point {
  x: number;
  y: number;
}

export interface ScaleFactors {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export interface PositionHistory {
  positions: Point[];
  lastUpdateTime: number;
  isBlinking: boolean;
  blinkStartTime: number;
}

export interface EyeRenderProps {
  indices: number[];
  landmarks: any;
  ctx: CanvasRenderingContext2D;
  videoElement: HTMLVideoElement;
  scaleFactors: ScaleFactors;
  positionHistory: Map<number, PositionHistory>;
}