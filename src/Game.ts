import { Application } from "pixi.js";
import { audioManager } from "./audio/AudioManager";
import {
  ArkanoidScene,
  BunnyScene,
  CongratulationsScene,
  GameOverScene,
  SceneManager,
} from "./scenes";
import {
  CompositeInputSource,
  InputAction,
  InputManager,
  JoystickInputSource,
  KeyboardInputSource,
} from "./input";

export class Game {
  private app!: Application;
  private sceneManager!: SceneManager;
  private inputManager!: InputManager;
  private readonly element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      width: 350,
      height: 750,
      background: "#000000",
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });
    this.element.appendChild(this.app.canvas);

    const compositeSource = new CompositeInputSource(
      new KeyboardInputSource(),
      new JoystickInputSource(),
    );
    this.inputManager = new InputManager(compositeSource);
    this.inputManager.setMapping({
      KeyW: InputAction.Up,
      KeyS: InputAction.Down,
      KeyA: InputAction.Left,
      KeyD: InputAction.Right,
      ArrowUp: InputAction.Up,
      ArrowDown: InputAction.Down,
      ArrowLeft: InputAction.Left,
      ArrowRight: InputAction.Right,
      Space: InputAction.Action1,
      KeyJ: InputAction.Action1,
      KeyK: InputAction.Action2,
      KeyL: InputAction.Action3,
      KeyU: InputAction.Action4,
      KeyI: InputAction.Action5,
      KeyO: InputAction.Action6,
      button0: InputAction.Action1,
      button1: InputAction.Action2,
      "axis0-": InputAction.Left,
      "axis0+": InputAction.Right,
      "axis1-": InputAction.Up,
      "axis1+": InputAction.Down,
    });
    this.inputManager.start();

    await audioManager.load({
      "ball-hit": "/assets/sfx/ball-hit.ogg",
      "block-hit": "/assets/sfx/block-hit.ogg",
      "steel-hit": "/assets/sfx/steel-hit.ogg",
      death: "/assets/sfx/death.ogg",
      bgm: "/assets/bgm/bgm1.ogg",
    });

    this.sceneManager = new SceneManager(
      this.app.stage,
      this.app.screen,
      this.app.ticker,
      this.inputManager,
      audioManager,
    );
  }

  async run(): Promise<void> {
    await this.init();
    this.sceneManager.add(
      "bunny",
      (parent, inputManager, sceneManager) =>
        new BunnyScene(parent, inputManager, sceneManager),
    );
    this.sceneManager.add(
      "arkanoid",
      (parent, inputManager, sceneManager) =>
        new ArkanoidScene(parent, inputManager, sceneManager),
    );
    this.sceneManager.add(
      "gameover",
      (parent, inputManager, sceneManager) =>
        new GameOverScene(parent, inputManager, sceneManager),
    );
    this.sceneManager.add(
      "congratulations",
      (parent, inputManager, sceneManager) =>
        new CongratulationsScene(parent, inputManager, sceneManager),
    );
    await this.sceneManager.start("arkanoid");
  }
}
