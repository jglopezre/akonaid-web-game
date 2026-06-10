import type { Sprite } from "pixi.js";

import type { CollisionCallback, CollisionGroup } from "../physics";

export enum ComponentType {
  Transform = 1 << 0,
  Velocity = 1 << 1,
  Sprite = 1 << 2,
  InputControlled = 1 << 3,
  Collider = 1 << 4,
}

export interface TransformData {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface VelocityData {
  vx: number;
  vy: number;
  angularVelocity: number;
}

export interface SpriteData {
  sprite: Sprite;
}

export type InputControlledData = Record<string, never>;

export interface ColliderData {
  width: number;
  height: number;
  isStatic: boolean;
  group: CollisionGroup;
  enabled: boolean;
  onCollide?: CollisionCallback;
}
