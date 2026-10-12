export interface Point {
  x: number;
  y: number;
}

export interface CircleData {
  pusat: Point;
  jariJari: number;
}

export interface LineIntersection {
  titik: Point;
  t: number;
}

export const EPSILON = 1e-9;
