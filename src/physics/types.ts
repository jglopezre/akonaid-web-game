import type { AABB } from "./AABBUtils";

export type CollisionGroup = number;

export type CollisionCallback = (self: number, other: number) => void;

export interface CollisionRule {
  groupA: CollisionGroup;
  groupB: CollisionGroup;
  processOverlap: boolean;
  callback?: CollisionCallback;
}

export interface ColliderSnapshot {
  entity: number;
  aabb: AABB;
  group: CollisionGroup;
  isStatic: boolean;
}

export interface CollisionPair {
  a: ColliderSnapshot;
  b: ColliderSnapshot;
  rule: CollisionRule;
}
