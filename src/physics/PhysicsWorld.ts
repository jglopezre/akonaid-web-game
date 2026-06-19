import { aabbIntersects, resolveOverlap } from "./AABBUtils";
import type {
  ColliderSnapshot,
  CollisionCallback,
  CollisionGroup,
  CollisionPair,
  CollisionRule,
} from "./types";

export class PhysicsWorld {
  private rules: CollisionRule[] = [];
  private pendingPairs: CollisionPair[] = [];

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
    this.pendingPairs = [];

    // DECISION: SpatialGrid eliminado.
    // Contexto Arkanoid: mundo 350x750, entidades colisionables < 60.
    // Con cellSize=128 se generaban ~18 celdas con ~3 entidades/celda.
    // El overhead de Map/Set/hash del grid superaba el beneficio.
    // Fuerza bruta O(N^2) con N=60 => ~1800 comparaciones AABB/frame.
    // En JS moderno esto es sub-milisegundo; mas simple y mas rapido.
    const len = snapshots.length;
    for (let i = 0; i < len; i++) {
      const a = snapshots[i];
      for (let j = i + 1; j < len; j++) {
        const b = snapshots[j];
        if (a.entity === b.entity) continue;

        const rule = this.matchRule(a.group, b.group);
        if (!rule) continue;

        if (!aabbIntersects(a.aabb, b.aabb)) continue;

        const pair: CollisionPair = { a, b, rule };
        this.pendingPairs.push(pair);

        this.resolvePair(pair);
      }
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
