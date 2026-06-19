import { Container, Ticker } from "pixi.js";
import type { AudioManager } from "../audio/AudioManager";

export interface ISceneScreen {
  width: number;
  height: number;
}

export interface ISceneContext {
  screen: ISceneScreen;
  audioManager: AudioManager;
}

export interface IScene {
  readonly name: string;
  readonly container: Container;

  init(context: ISceneContext): void | Promise<void>;
  create(): void | Promise<void>;
  update(ticker: Ticker): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}
