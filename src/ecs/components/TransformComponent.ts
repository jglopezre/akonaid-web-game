import { ComponentType } from "../types";
import type { TransformData } from "../types";

export type { TransformData } from "../types";

export const TRANSFORM = ComponentType.Transform;

export function createTransform(
  overrides?: Partial<TransformData>,
): TransformData {
  return {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    ...overrides,
  };
}
