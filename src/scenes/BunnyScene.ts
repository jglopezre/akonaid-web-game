import { Assets, Container, Sprite, Ticker } from "pixi.js";
import type { InputManager } from "../input/InputManager";
import { InputAction } from "../input/InputAction";
import type { IScene, ISceneContext } from "./IScene";

export class BunnyScene implements IScene {
  readonly name = "bunny";
  readonly container: Container;

  private readonly inputManager: InputManager;
  private bunny: Sprite | null = null;
  private centerX = 0;
  private centerY = 0;
  private speed = 300;

  constructor(_parent: Container, inputManager: InputManager) {
    this.inputManager = inputManager;
    this.container = new Container();
    this.container.label = "bunny-scene";
  }

  async init(context: ISceneContext): Promise<void> {
    this.centerX = context.screen.width / 2;
    this.centerY = context.screen.height / 2;
  }

  async create(): Promise<void> {
    const texture = await Assets.load("/assets/bunny.png");
    this.bunny = new Sprite(texture);
    this.bunny.anchor.set(0.5);
    this.bunny.position.set(this.centerX, this.centerY);
    this.container.addChild(this.bunny);
  }

  update(ticker: Ticker): void {
    if (!this.bunny) return;

    const delta = ticker.deltaTime;
    const move = this.speed * (delta / 60);

    if (this.inputManager.isPressed(InputAction.Left)) {
      this.bunny.x -= move;
    }
    if (this.inputManager.isPressed(InputAction.Right)) {
      this.bunny.x += move;
    }
    if (this.inputManager.isPressed(InputAction.Up)) {
      this.bunny.y -= move;
    }
    if (this.inputManager.isPressed(InputAction.Down)) {
      this.bunny.y += move;
    }

    this.bunny.rotation += 0.01 * delta;
  }

  pause(): void {
    this.container.visible = false;
  }

  resume(): void {
    this.container.visible = true;
  }

  destroy(): void {
    this.bunny = null;
    this.container.destroy({ children: true });
  }
}
