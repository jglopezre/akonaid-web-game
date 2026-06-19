export interface InputSourceEvent {
  key: string;
  pressed: boolean;
}

export type InputSourceCallback = (event: InputSourceEvent) => void;

export interface IInputSource {
  start(): void;
  stop(): void;
  update(): void;
  addListener(callback: InputSourceCallback): void;
  removeListener(callback: InputSourceCallback): void;
}
