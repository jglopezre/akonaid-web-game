import type { World } from "../World";
import type { ISystem } from "./ISystem";
import { ComponentType } from "../types";
import type { TransformData, VelocityData } from "../types";

export class MovementSystem implements ISystem {
  readonly requiredMask = ComponentType.Transform | ComponentType.Velocity;

  private world: World | null = null;

  init(world: World): void {
    this.world = world;
  }

  update(deltaTime: number): void {
    if (!this.world) return;

    const dt = deltaTime / 60;
    const entities = this.world.queryEntities(this.requiredMask);

    for (const entity of entities) {
      const transform = this.world.getComponent<TransformData>(
        entity,
        ComponentType.Transform,
      );
      const velocity = this.world.getComponent<VelocityData>(
        entity,
        ComponentType.Velocity,
      );
      if (!transform || !velocity) continue;

      transform.x += velocity.vx * dt;
      transform.y += velocity.vy * dt;
      transform.rotation += velocity.angularVelocity * dt;
    }
  }

  destroy(): void {
    this.world = null;
  }
}
