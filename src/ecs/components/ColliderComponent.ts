import { ComponentType } from "../types";
import type { ColliderData } from "../types";

export type { ColliderData } from "../types";

export const COLLIDER = ComponentType.Collider;

export function createCollider(
  overrides?: Partial<ColliderData>,
): ColliderData {
  return {
    width: 32,
    height: 32,
    isStatic: false,
    group: 0,
    enabled: true,
    ...overrides,
  };
}
