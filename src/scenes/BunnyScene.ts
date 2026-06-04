import { Assets, Container, Sprite, Ticker } from "pixi.js";
import type { IScene, ISceneContext } from "./IScene";

export class BunnyScene implements IScene {
  readonly name = "bunny";
  readonly container: Container;

  private bunny: Sprite | null = null;
  private centerX = 0;
  private centerY = 0;

  constructor(_parent: Container) {
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
    if (this.bunny) {
      this.bunny.rotation += 0.01 * ticker.deltaTime;
    }
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
