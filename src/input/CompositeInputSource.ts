import type {
  IInputSource,
  InputSourceCallback,
  InputSourceEvent,
} from "./IInputSource";

export class CompositeInputSource implements IInputSource {
  private readonly sources: IInputSource[];
  private readonly listeners: Set<InputSourceCallback> = new Set();
  private readonly bridge: InputSourceCallback;

  constructor(...sources: IInputSource[]) {
    this.sources = sources;
    this.bridge = (event: InputSourceEvent) => {
      for (const listener of this.listeners) {
        listener(event);
      }
    };
  }

  start(): void {
    for (const source of this.sources) {
      source.start();
    }
  }

  stop(): void {
    for (const source of this.sources) {
      source.stop();
    }
  }

  update(): void {
    for (const source of this.sources) {
      source.update();
    }
  }

  addListener(callback: InputSourceCallback): void {
    this.listeners.add(callback);
    if (this.listeners.size === 1) {
      for (const source of this.sources) {
        source.addListener(this.bridge);
      }
    }
  }

  removeListener(callback: InputSourceCallback): void {
    this.listeners.delete(callback);
    if (this.listeners.size === 0) {
      for (const source of this.sources) {
        source.removeListener(this.bridge);
      }
    }
  }
}
