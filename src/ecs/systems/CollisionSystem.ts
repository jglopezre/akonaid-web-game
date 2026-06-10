import type { World } from "../World";
import type { ISystem } from "./ISystem";
import { ComponentType } from "../types";
import type { TransformData, ColliderData } from "../types";
import type { PhysicsWorld } from "../../physics/PhysicsWorld";
import type { ColliderSnapshot } from "../../physics/types";
import { centerAABB } from "../../physics/AABBUtils";

export class CollisionSystem implements ISystem {
  readonly requiredMask = ComponentType.Transform | ComponentType.Collider;

  private world: World | null = null;
  private physicsWorld: PhysicsWorld;

  constructor(physicsWorld: PhysicsWorld) {
    this.physicsWorld = physicsWorld;
  }

  init(world: World): void {
    this.world = world;
  }

  update(_deltaTime: number): void {
    if (!this.world) return;

    const entities = this.world.queryEntities(this.requiredMask);
    const snapshots: ColliderSnapshot[] = [];
    const entitySnapshotMap = new Map<number, ColliderSnapshot>();

    for (const entity of entities) {
      const transform = this.world.getComponent<TransformData>(
        entity,
        ComponentType.Transform,
      );
      const collider = this.world.getComponent<ColliderData>(
        entity,
        ComponentType.Collider,
      );
      if (!transform || !collider || !collider.enabled) continue;

      const aabb = centerAABB(
        transform.x,
        transform.y,
        collider.width,
        collider.height,
      );

      const snapshot: ColliderSnapshot = {
        entity,
        aabb,
        group: collider.group,
        isStatic: collider.isStatic,
      };

      snapshots.push(snapshot);
      entitySnapshotMap.set(entity, snapshot);
    }

    const pairs = this.physicsWorld.step(snapshots);

    for (const pair of pairs) {
      if (!pair.rule.processOverlap) continue;

      const snapA = entitySnapshotMap.get(pair.a.entity);
      const snapB = entitySnapshotMap.get(pair.b.entity);
      if (!snapA || !snapB) continue;

      this.syncAABBPosition(this.world, pair.a.entity, snapA.aabb);
      this.syncAABBPosition(this.world, pair.b.entity, snapB.aabb);
    }

    this.physicsWorld.flushCallbacks();

    for (const entity of entities) {
      const collider = this.world.getComponent<ColliderData>(
        entity,
        ComponentType.Collider,
      );
      if (!collider?.onCollide) continue;

      const snapshot = entitySnapshotMap.get(entity);
      if (!snapshot) continue;

      for (const pair of pairs) {
        if (pair.a.entity === entity && pair.b.entity !== entity) {
          collider.onCollide(entity, pair.b.entity);
        } else if (pair.b.entity === entity && pair.a.entity !== entity) {
          collider.onCollide(entity, pair.a.entity);
        }
      }
    }
  }

  destroy(): void {
    this.world = null;
  }

  private syncAABBPosition(
    world: World,
    entity: number,
    aabb: { x: number; y: number; width: number; height: number },
  ): void {
    const transform = world.getComponent<TransformData>(
      entity,
      ComponentType.Transform,
    );
    if (!transform) return;

    transform.x = aabb.x + aabb.width / 2;
    transform.y = aabb.y + aabb.height / 2;
  }
}
