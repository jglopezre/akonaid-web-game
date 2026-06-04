import type {
  IInputSource,
  InputSourceCallback,
  InputSourceEvent,
} from "./IInputSource";

export class KeyboardInputSource implements IInputSource {
  private readonly listeners: Set<InputSourceCallback> = new Set();
  private readonly heldKeys: Set<string> = new Set();
  private boundOnKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundOnKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private active = false;

  start(): void {
    if (this.active) return;
    this.active = true;

    this.boundOnKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (this.heldKeys.has(e.code)) return;
      this.heldKeys.add(e.code);
      this.emit({ key: e.code, pressed: true });
    };

    this.boundOnKeyUp = (e: KeyboardEvent) => {
      this.heldKeys.delete(e.code);
      this.emit({ key: e.code, pressed: false });
    };

    window.addEventListener("keydown", this.boundOnKeyDown);
    window.addEventListener("keyup", this.boundOnKeyUp);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;

    if (this.boundOnKeyDown) {
      window.removeEventListener("keydown", this.boundOnKeyDown);
      this.boundOnKeyDown = null;
    }
    if (this.boundOnKeyUp) {
      window.removeEventListener("keyup", this.boundOnKeyUp);
      this.boundOnKeyUp = null;
    }

    for (const key of this.heldKeys) {
      this.emit({ key, pressed: false });
    }
    this.heldKeys.clear();
    this.listeners.clear();
  }

  update(): void {
    // no-op: el teclado es event-driven
  }

  addListener(callback: InputSourceCallback): void {
    this.listeners.add(callback);
  }

  removeListener(callback: InputSourceCallback): void {
    this.listeners.delete(callback);
  }

  private emit(event: InputSourceEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
