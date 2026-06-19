import type {
  IInputSource,
  InputSourceCallback,
  InputSourceEvent,
} from "./IInputSource";

export interface JoystickConfig {
  deadzone: number;
  pollGamepadIndex: number;
}

const DEFAULT_CONFIG: JoystickConfig = {
  deadzone: 0.15,
  pollGamepadIndex: 0,
};

export class JoystickInputSource implements IInputSource {
  private readonly listeners: Set<InputSourceCallback> = new Set();
  private readonly config: JoystickConfig;
  private previousButtons: boolean[] = [];
  private previousAxes: number[] = [];
  private active = false;
  private onConnect: ((e: GamepadEvent) => void) | null = null;
  private onDisconnect: ((e: GamepadEvent) => void) | null = null;

  constructor(config: Partial<JoystickConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(): void {
    if (this.active) return;
    this.active = true;

    this.onConnect = (e: GamepadEvent) => {
      console.log(
        `[Joystick] Conectado: ${e.gamepad.id} (${e.gamepad.buttons.length} botones, ${e.gamepad.axes.length} ejes)`,
      );
    };
    this.onDisconnect = (e: GamepadEvent) => {
      console.log(`[Joystick] Desconectado: ${e.gamepad.id}`);
    };
    window.addEventListener("gamepadconnected", this.onConnect);
    window.addEventListener("gamepaddisconnected", this.onDisconnect);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;

    if (this.onConnect) {
      window.removeEventListener("gamepadconnected", this.onConnect);
      this.onConnect = null;
    }
    if (this.onDisconnect) {
      window.removeEventListener("gamepaddisconnected", this.onDisconnect);
      this.onDisconnect = null;
    }

    this.previousButtons = [];
    this.previousAxes = [];
  }

  update(): void {
    if (!this.active) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.config.pollGamepadIndex];
    if (!gamepad) {
      this.releaseAll();
      return;
    }

    this.pollButtons(gamepad.buttons);
    this.pollAxes(gamepad.axes);
  }

  addListener(callback: InputSourceCallback): void {
    this.listeners.add(callback);
  }

  removeListener(callback: InputSourceCallback): void {
    this.listeners.delete(callback);
  }

  private pollButtons(buttons: readonly GamepadButton[]): void {
    for (let i = 0; i < buttons.length; i++) {
      const pressed = buttons[i].pressed;
      const previous = this.previousButtons[i] ?? false;

      if (pressed !== previous) {
        this.emit({ key: `button${i}`, pressed });
      }
    }
    this.previousButtons = buttons.map((b) => b.pressed);
  }

  private pollAxes(axes: readonly number[]): void {
    const dz = this.config.deadzone;

    for (let i = 0; i < axes.length; i++) {
      const value = axes[i];
      const previousValue = this.previousAxes[i] ?? 0;

      const positiveWas = previousValue > dz;
      const negativeWas = previousValue < -dz;
      const positiveIs = value > dz;
      const negativeIs = value < -dz;

      if (positiveIs !== positiveWas) {
        this.emit({ key: `axis${i}+`, pressed: positiveIs });
      }
      if (negativeIs !== negativeWas) {
        this.emit({ key: `axis${i}-`, pressed: negativeIs });
      }
    }
    this.previousAxes = [...axes];
  }

  private releaseAll(): void {
    for (let i = 0; i < this.previousButtons.length; i++) {
      if (this.previousButtons[i]) {
        this.emit({ key: `button${i}`, pressed: false });
      }
    }
    this.previousButtons = [];

    for (let i = 0; i < this.previousAxes.length; i++) {
      const value = this.previousAxes[i];
      if (Math.abs(value) > this.config.deadzone) {
        this.emit({ key: `axis${i}+`, pressed: false });
        this.emit({ key: `axis${i}-`, pressed: false });
      }
    }
    this.previousAxes = [];
  }

  private emit(event: InputSourceEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
