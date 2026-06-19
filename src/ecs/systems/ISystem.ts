import type { World } from "../World";

export interface ISystem {
  readonly requiredMask: number;
  init(world: World): void;
  update(deltaTime: number): void;
  destroy(): void;
}
