import { sound } from "@pixi/sound";
import { Assets } from "pixi.js";

export interface AudioPlayOptions {
  loop?: boolean;
  volume?: number;
}

export class AudioManager {
  private _loaded = new Set<string>();
  private _globalMuted = false;

  async load(manifest: Record<string, string>): Promise<void> {
    const entries = Object.entries(manifest);
    await Promise.all(
      entries.map(async ([alias, url]) => {
        if (this._loaded.has(alias)) return;
        await Assets.load(url);
        sound.add(alias, url);
        this._loaded.add(alias);
      }),
    );
  }

  play(alias: string, options?: AudioPlayOptions): void {
    if (!this._loaded.has(alias)) return;
    sound.play(alias, {
      loop: options?.loop ?? false,
      volume: options?.volume ?? 1,
    });
  }

  stop(alias: string): void {
    if (!this._loaded.has(alias)) return;
    sound.stop(alias);
  }

  setVolume(alias: string, value: number): void {
    if (!this._loaded.has(alias)) return;
    sound.volume(alias, Math.max(0, Math.min(1, value)));
  }

  mute(): void {
    if (this._globalMuted) return;
    this._globalMuted = true;
    sound.muteAll();
  }

  unmute(): void {
    if (!this._globalMuted) return;
    this._globalMuted = false;
    sound.unmuteAll();
  }

  stopAll(): void {
    sound.stopAll();
  }
}

export const audioManager = new AudioManager();
