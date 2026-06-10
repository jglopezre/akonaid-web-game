import type { World } from "../World";
import type { ISystem } from "./ISystem";
import { ComponentType } from "../types";
import type { TransformData, SpriteData } from "../types";

export class RenderSystem implements ISystem {
  readonly requiredMask = ComponentType.Transform | ComponentType.Sprite;

  private world: World | null = null;

  init(world: World): void {
    this.world = world;
  }

  update(_deltaTime: number): void {
    if (!this.world) return;

    const entities = this.world.queryEntities(this.requiredMask);

    for (const entity of entities) {
      const transform = this.world.getComponent<TransformData>(
        entity,
        ComponentType.Transform,
      );
      const spriteData = this.world.getComponent<SpriteData>(
        entity,
        ComponentType.Sprite,
      );
      if (!transform || !spriteData) continue;

      const sprite = spriteData.sprite;
      sprite.position.set(transform.x, transform.y);
      sprite.rotation = transform.rotation;
      sprite.scale.set(transform.scaleX, transform.scaleY);
    }
  }

  destroy(): void {
    this.world = null;
  }
}
