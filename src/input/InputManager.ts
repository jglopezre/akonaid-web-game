import { EventEmitter } from "eventemitter3";
import { InputAction } from "./InputAction";
import type { IInputSource, InputSourceEvent } from "./IInputSource";

export class InputManager {
  private readonly emitter: EventEmitter;
  private readonly source: IInputSource;
  private readonly state: Map<InputAction, boolean> = new Map();
  private mapping: Map<string, InputAction> = new Map();
  private sourceCallback: ((event: InputSourceEvent) => void) | null = null;
  private active = false;

  constructor(source: IInputSource) {
    this.source = source;
    this.emitter = new EventEmitter();

    for (const action of Object.values(InputAction)) {
      this.state.set(action, false);
    }
  }

  setMapping(mapping: Record<string, InputAction>): void {
    this.mapping = new Map(Object.entries(mapping));
  }

  getMapping(): Record<string, InputAction> {
    return Object.fromEntries(this.mapping);
  }

  isPressed(action: InputAction): boolean {
    return this.state.get(action) ?? false;
  }

  onActionStart(action: InputAction, callback: () => void): void {
    this.emitter.on(`${action}:start`, callback);
  }

  onActionEnd(action: InputAction, callback: () => void): void {
    this.emitter.on(`${action}:end`, callback);
  }

  offAction(action: InputAction, callback: () => void): void {
    this.emitter.off(`${action}:start`, callback);
    this.emitter.off(`${action}:end`, callback);
  }

  start(): void {
    if (this.active) return;
    this.active = true;

    this.sourceCallback = (event: InputSourceEvent) => {
      this.handleInput(event);
    };
    this.source.addListener(this.sourceCallback);
    this.source.start();
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;

    if (this.sourceCallback) {
      this.source.removeListener(this.sourceCallback);
      this.sourceCallback = null;
    }
    this.source.stop();
  }

  update(): void {
    if (this.active) {
      this.source.update();
    }
  }

  destroy(): void {
    this.stop();
    this.emitter.removeAllListeners();
    this.mapping.clear();
    this.state.clear();
  }

  private handleInput(event: InputSourceEvent): void {
    const action = this.mapping.get(event.key);
    if (!action) return;

    const wasPressed = this.state.get(action) ?? false;
    if (event.pressed === wasPressed) return;

    this.state.set(action, event.pressed);

    if (event.pressed) {
      this.emitter.emit(`${action}:start`);
    } else {
      this.emitter.emit(`${action}:end`);
    }
  }
}
