import { ComponentType } from "../types";
import type { SpriteData } from "../types";

export type { SpriteData } from "../types";

export const SPRITE = ComponentType.Sprite;

export function createSprite(data: SpriteData): SpriteData {
  return data;
}
