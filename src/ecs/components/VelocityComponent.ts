import { ComponentType } from "../types";
import type { VelocityData } from "../types";

export type { VelocityData } from "../types";

export const VELOCITY = ComponentType.Velocity;

export function createVelocity(
  overrides?: Partial<VelocityData>,
): VelocityData {
  return {
    vx: 0,
    vy: 0,
    angularVelocity: 0,
    ...overrides,
  };
}
