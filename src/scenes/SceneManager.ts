import { Container, Ticker } from "pixi.js";
import type { InputManager } from "../input/InputManager";
import type { IScene, ISceneScreen } from "./IScene";

export type SceneFactory = (
  parent: Container,
  inputManager: InputManager,
) => IScene;

export class SceneManager {
  private readonly parentContainer: Container;
  private readonly screen: ISceneScreen;
  private readonly ticker: Ticker;
  private readonly inputManager: InputManager;
  private readonly factories: Map<string, SceneFactory> = new Map();

  private activeScene: IScene | null = null;
  private activeKey: string | null = null;
  private pausedScene: IScene | null = null;
  private pausedKey: string | null = null;
  private tickerCallback: ((t: Ticker) => void) | null = null;

  constructor(
    parentContainer: Container,
    screen: ISceneScreen,
    ticker: Ticker,
    inputManager: InputManager,
  ) {
    this.parentContainer = parentContainer;
    this.screen = screen;
    this.ticker = ticker;
    this.inputManager = inputManager;
  }

  getInputManager(): InputManager {
    return this.inputManager;
  }

  add(name: string, factory: SceneFactory): void {
    if (this.factories.has(name)) {
      throw new Error(`Scene "${name}" is already registered.`);
    }
    this.factories.set(name, factory);
  }

  getActive(): IScene | null {
    return this.activeScene;
  }

  getActiveKey(): string | null {
    return this.activeKey;
  }

  async start(name: string): Promise<void> {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Scene "${name}" is not registered.`);
    }

    if (this.pausedScene) {
      this.pausedScene.destroy();
      this.pausedScene = null;
      this.pausedKey = null;
    }

    this.removeActiveScene();

    const scene = factory(this.parentContainer, this.inputManager);
    await scene.init({ screen: this.screen });
    await scene.create();

    this.parentContainer.addChild(scene.container);
    this.activeScene = scene;
    this.activeKey = name;

    this.ensureUpdateLoop();
  }

  pause(): void {
    if (!this.activeScene) return;

    const scene = this.activeScene;
    scene.pause();

    if (scene.container.parent) {
      scene.container.parent.removeChild(scene.container);
    }

    this.pausedScene = scene;
    this.pausedKey = this.activeKey;
    this.activeScene = null;
    this.activeKey = null;

    this.removeUpdateLoop();
  }

  resume(): void {
    if (!this.pausedScene) return;

    const scene = this.pausedScene;
    scene.resume();

    this.parentContainer.addChild(scene.container);

    this.activeScene = scene;
    this.activeKey = this.pausedKey;
    this.pausedScene = null;
    this.pausedKey = null;

    this.ensureUpdateLoop();
  }

  stop(): void {
    if (this.pausedScene) {
      this.pausedScene.destroy();
      this.pausedScene = null;
      this.pausedKey = null;
    }
    this.removeActiveScene();
  }

  destroy(): void {
    this.stop();
    this.factories.clear();
  }

  private removeActiveScene(): void {
    if (!this.activeScene) return;

    this.removeUpdateLoop();
    this.activeScene.destroy();
    this.activeScene = null;
    this.activeKey = null;
  }

  private ensureUpdateLoop(): void {
    if (this.tickerCallback) return;
    this.tickerCallback = (ticker: Ticker) => {
      this.inputManager.update();
      if (this.activeScene) {
        this.activeScene.update(ticker);
      }
    };
    this.ticker.add(this.tickerCallback);
  }

  private removeUpdateLoop(): void {
    if (this.tickerCallback) {
      this.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
  }
}
