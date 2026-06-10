import type { ColliderSnapshot } from "./types";
import { aabbIntersects } from "./AABBUtils";

export class SpatialGrid {
  private cells: Map<number, ColliderSnapshot[]> = new Map();
  private readonly cellSize: number;

  constructor(cellSize: number = 128) {
    this.cellSize = cellSize;
  }

  clear(): void {
    this.cells.clear();
  }

  insert(snapshot: ColliderSnapshot): void {
    const { aabb } = snapshot;
    const startX = Math.floor(aabb.x / this.cellSize);
    const startY = Math.floor(aabb.y / this.cellSize);
    const endX = Math.floor((aabb.x + aabb.width) / this.cellSize);
    const endY = Math.floor((aabb.y + aabb.height) / this.cellSize);

    for (let cy = startY; cy <= endY; cy++) {
      for (let cx = startX; cx <= endX; cx++) {
        const key = this.hash(cx, cy);
        if (!this.cells.has(key)) {
          this.cells.set(key, []);
        }
        this.cells.get(key)!.push(snapshot);
      }
    }
  }

  queryPotentialPairs(): Array<[ColliderSnapshot, ColliderSnapshot]> {
    const pairs: Array<[ColliderSnapshot, ColliderSnapshot]> = [];
    const seen = new Set<number>();

    for (const cell of this.cells.values()) {
      const len = cell.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const a = cell[i];
          const b = cell[j];
          if (a.entity === b.entity) continue;

          const pairKey =
            a.entity < b.entity
              ? (a.entity << 16) | b.entity
              : (b.entity << 16) | a.entity;

          if (seen.has(pairKey)) continue;
          seen.add(pairKey);

          if (!aabbIntersects(a.aabb, b.aabb)) continue;

          pairs.push([a, b]);
        }
      }
    }

    return pairs;
  }

  private hash(x: number, y: number): number {
    return (x * 73856093) ^ (y * 19349663);
  }
}
