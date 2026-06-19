import { Assets, Container, Sprite, Text, Ticker } from "pixi.js";
import type { InputManager } from "../input/InputManager";
import type { IScene, ISceneContext } from "./IScene";
import type { SceneManager } from "./SceneManager";

export class GameOverScene implements IScene {
  readonly name = "gameover";
  readonly container: Container;

  private readonly sceneManager: SceneManager;

  constructor(
    _parent: Container,
    _inputManager: InputManager,
    sceneManager: SceneManager,
  ) {
    this.sceneManager = sceneManager;
    this.container = new Container();
    this.container.label = "gameover-scene";
  }

  async init(_context: ISceneContext): Promise<void> {}

  async create(): Promise<void> {
    const bgTexture = await Assets.load(
      "/assets/images/gameover-background.png",
    );
    const bg = new Sprite(bgTexture);
    this.container.addChild(bg);

    const title = new Text({
      text: "GAME OVER",
      style: {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0xffffff,
      },
    });
    title.anchor.set(0.5);
    title.position.set(175, 300);
    this.container.addChild(title);

    const btn = new Text({
      text: "RESTART",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffff00,
      },
    });
    btn.anchor.set(0.5);
    btn.position.set(175, 450);
    btn.eventMode = "static";
    btn.cursor = "pointer";
    btn.on("pointerdown", () => {
      this.sceneManager.start("arkanoid");
    });
    this.container.addChild(btn);
  }

  update(_ticker: Ticker): void {}

  pause(): void {
    this.container.visible = false;
  }

  resume(): void {
    this.container.visible = true;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
