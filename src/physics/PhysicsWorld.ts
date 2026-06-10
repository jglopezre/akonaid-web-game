import { SpatialGrid } from "./SpatialGrid";
import { resolveOverlap } from "./AABBUtils";
import type {
  ColliderSnapshot,
  CollisionCallback,
  CollisionGroup,
  CollisionPair,
  CollisionRule,
} from "./types";

export class PhysicsWorld {
  private rules: CollisionRule[] = [];
  private spatialGrid: SpatialGrid;
  private pendingPairs: CollisionPair[] = [];

  constructor(cellSize: number = 128) {
    this.spatialGrid = new SpatialGrid(cellSize);
  }

  collider(
    groupA: CollisionGroup,
    groupB: CollisionGroup,
    callback?: CollisionCallback,
  ): PhysicsWorld {
    this.rules.push({ groupA, groupB, processOverlap: true, callback });
    return this;
  }

  overlap(
    groupA: CollisionGroup,
    groupB: CollisionGroup,
    callback?: CollisionCallback,
  ): PhysicsWorld {
    this.rules.push({ groupA, groupB, processOverlap: false, callback });
    return this;
  }

  clearRules(): void {
    this.rules = [];
  }

  step(snapshots: ColliderSnapshot[]): CollisionPair[] {
    this.spatialGrid.clear();
    this.pendingPairs = [];

    for (const snap of snapshots) {
      this.spatialGrid.insert(snap);
    }

    const candidates = this.spatialGrid.queryPotentialPairs();

    for (const [a, b] of candidates) {
      const rule = this.matchRule(a.group, b.group);
      if (!rule) continue;

      const pair: CollisionPair = { a, b, rule };
      this.pendingPairs.push(pair);

      this.resolvePair(pair);
    }

    return this.pendingPairs;
  }

  flushCallbacks(): void {
    for (const pair of this.pendingPairs) {
      pair.rule.callback?.(pair.a.entity, pair.b.entity);
    }
    this.pendingPairs = [];
  }

  private matchRule(
    groupA: CollisionGroup,
    groupB: CollisionGroup,
  ): CollisionRule | null {
    for (const rule of this.rules) {
      if (
        (rule.groupA === groupA && rule.groupB === groupB) ||
        (rule.groupA === groupB && rule.groupB === groupA)
      ) {
        return rule;
      }
    }
    return null;
  }

  private resolvePair(pair: CollisionPair): void {
    const { a, b, rule } = pair;
    if (!rule.processOverlap) return;

    if (a.isStatic && b.isStatic) return;

    if (a.isStatic) {
      const result = resolveOverlap(b.aabb, a.aabb);
      if (result) {
        b.aabb.x += result.x;
        b.aabb.y += result.y;
      }
    } else if (b.isStatic) {
      const result = resolveOverlap(a.aabb, b.aabb);
      if (result) {
        a.aabb.x += result.x;
        a.aabb.y += result.y;
      }
    } else {
      const resultA = resolveOverlap(a.aabb, b.aabb);
      if (resultA) {
        const halfX = resultA.x / 2;
        const halfY = resultA.y / 2;
        a.aabb.x += halfX;
        a.aabb.y += halfY;
        b.aabb.x -= halfX;
        b.aabb.y -= halfY;
      }
    }
  }
}
