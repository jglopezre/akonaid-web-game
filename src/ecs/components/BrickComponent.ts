import { ComponentType } from "../types";
import type { BrickData } from "../types";

export type { BrickData } from "../types";
export const BRICK = ComponentType.Brick;

export function createBrick(overrides?: Partial<BrickData>): BrickData {
  return {
    type: "normal",
    points: 10,
    ...overrides,
  };
}
