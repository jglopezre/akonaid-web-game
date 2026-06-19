import type { World } from "../World";
import type { ISystem } from "./ISystem";
import type { InputManager } from "../../input/InputManager";
import { InputAction } from "../../input/InputAction";
import { ComponentType } from "../types";
import type { VelocityData } from "../types";

export class InputSystem implements ISystem {
  readonly requiredMask =
    ComponentType.Transform | ComponentType.InputControlled;

  private world: World | null = null;
  private inputManager: InputManager;
  private speed: number;

  constructor(inputManager: InputManager, speed: number) {
    this.inputManager = inputManager;
    this.speed = speed;
  }

  init(world: World): void {
    this.world = world;
  }

  update(_deltaTime: number): void {
    if (!this.world) return;

    let vx = 0;

    if (this.inputManager.isPressed(InputAction.Left)) {
      vx -= this.speed;
    }
    if (this.inputManager.isPressed(InputAction.Right)) {
      vx += this.speed;
    }

    const entities = this.world.queryEntities(this.requiredMask);
    for (const entity of entities) {
      const velocity = this.world.getComponent<VelocityData>(
        entity,
        ComponentType.Velocity,
      );
      if (velocity) {
        velocity.vx = vx;
        // vy se mantiene intacto (ej. para gravedad o lógica custom);
        // el movimiento vertical del paddle se bloquea en la escena
      }
    }
  }

  destroy(): void {
    this.world = null;
  }
}
