import { Application } from "pixi.js";
import { BunnyScene, SceneManager } from "./scenes";
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
      background: "#1099bb",
      resizeTo: window,
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

    this.sceneManager = new SceneManager(
      this.app.stage,
      this.app.screen,
      this.app.ticker,
      this.inputManager,
    );
  }

  async run(): Promise<void> {
    await this.init();
    this.sceneManager.add(
      "bunny",
      (parent, inputManager) => new BunnyScene(parent, inputManager),
    );
    await this.sceneManager.start("bunny");
  }
}
