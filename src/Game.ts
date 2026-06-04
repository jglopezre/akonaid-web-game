import { Application } from "pixi.js";
import { BunnyScene, SceneManager } from "./scenes";

export class Game {
  private app!: Application;
  private sceneManager!: SceneManager;
  private readonly element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      background: "#1099bb",
      resizeTo: window,
    });
    this.element.appendChild(this.app.canvas);

    this.sceneManager = new SceneManager(
      this.app.stage,
      this.app.screen,
      this.app.ticker,
    );
  }

  async run(): Promise<void> {
    await this.init();
    this.sceneManager.add("bunny", (parent) => new BunnyScene(parent));
    await this.sceneManager.start("bunny");
  }
}
