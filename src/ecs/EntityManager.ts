import type { ComponentType } from "./types";

export class EntityManager {
  private masks: Map<number, number> = new Map();
  private nextId = 1;

  createEntity(): number {
    const id = this.nextId++;
    this.masks.set(id, 0);
    return id;
  }

  destroyEntity(id: number): void {
    this.masks.delete(id);
  }

  isAlive(id: number): boolean {
    return this.masks.has(id);
  }

  getMask(id: number): number {
    return this.masks.get(id) ?? 0;
  }

  addComponent(id: number, type: ComponentType): void {
    const mask = this.masks.get(id);
    if (mask !== undefined) {
      this.masks.set(id, mask | type);
    }
  }

  removeComponent(id: number, type: ComponentType): void {
    const mask = this.masks.get(id);
    if (mask !== undefined) {
      this.masks.set(id, mask & ~type);
    }
  }

  hasComponent(id: number, type: ComponentType): boolean {
    return ((this.masks.get(id) ?? 0) & type) !== 0;
  }

  getEntitiesWithMask(requiredMask: number): number[] {
    const result: number[] = [];
    for (const [id, mask] of this.masks) {
      if ((mask & requiredMask) === requiredMask) {
        result.push(id);
      }
    }
    return result;
  }

  destroy(): void {
    this.masks.clear();
    this.nextId = 1;
  }
}
