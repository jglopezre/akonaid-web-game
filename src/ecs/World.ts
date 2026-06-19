import { EntityManager } from "./EntityManager";
import { ComponentType } from "./types";
import type {
  TransformData,
  VelocityData,
  SpriteData,
  InputControlledData,
  ColliderData,
  BallData,
  BrickData,
} from "./types";
import type { ISystem } from "./systems/ISystem";

type ComponentStore<T> = Map<number, T>;

export class World {
  private entityManager: EntityManager;
  private stores: Map<ComponentType, ComponentStore<unknown>>;
  private systems: ISystem[];

  constructor() {
    this.entityManager = new EntityManager();
    this.stores = new Map();
    this.systems = [];
  }

  addSystem(system: ISystem): void {
    system.init(this);
    this.systems.push(system);
  }

  createEntity(): EntityBuilder {
    return new EntityBuilder(this, this.entityManager.createEntity());
  }

  destroyEntity(id: number): void {
    for (const store of this.stores.values()) {
      store.delete(id);
    }
    this.entityManager.destroyEntity(id);
  }

  getComponent<T>(entity: number, type: ComponentType): T | undefined {
    return this.stores.get(type)?.get(entity) as T | undefined;
  }

  setComponent<T>(entity: number, type: ComponentType, data: T): void {
    if (!this.stores.has(type)) {
      this.stores.set(type, new Map());
    }
    this.stores.get(type)!.set(entity, data);
    this.entityManager.addComponent(entity, type);
  }

  removeComponent(entity: number, type: ComponentType): void {
    this.stores.get(type)?.delete(entity);
    this.entityManager.removeComponent(entity, type);
  }

  queryEntities(mask: number): number[] {
    return this.entityManager.getEntitiesWithMask(mask);
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  destroy(): void {
    for (const system of this.systems) {
      system.destroy();
    }
    this.systems = [];
    for (const store of this.stores.values()) {
      store.clear();
    }
    this.stores.clear();
    this.entityManager.destroy();
  }
}

export class EntityBuilder {
  private world: World;
  private entity: number;

  constructor(world: World, entity: number) {
    this.world = world;
    this.entity = entity;
  }

  with(type: ComponentType.Transform, data: TransformData): this;
  with(type: ComponentType.Velocity, data: VelocityData): this;
  with(type: ComponentType.Sprite, data: SpriteData): this;
  with(type: ComponentType.InputControlled, data: InputControlledData): this;
  with(type: ComponentType.Collider, data: ColliderData): this;
  with(type: ComponentType.Ball, data: BallData): this;
  with(type: ComponentType.Brick, data: BrickData): this;
  with(type: ComponentType, data: unknown): this {
    this.world.setComponent(this.entity, type, data);
    return this;
  }

  build(): number {
    return this.entity;
  }
}
