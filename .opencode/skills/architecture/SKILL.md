---
name: architecture
description: "Use this skill when designing game architecture, refactoring game systems, or implementing classic game programming patterns in TypeScript. Covers: Command (input mapping, undo/redo), Flyweight (shared state for massive entities), Observer (decoupled notifications), Prototype (cloning entities), Singleton (single-instance services), State (FSM for entity behavior), Double Buffer (atomic state transitions), Game Loop (fixed timestep), Update Method (entity tick iteration), Bytecode (sandboxed VM scripting), Subclass Sandbox (protected base-class capabilities), Type Object (data-driven entity variants), Component (ECS-like composition), Event Queue (deferred message processing), Service Locator (decoupled service access), Data Locality (contiguous memory via TypedArrays), Dirty Flag (deferred recomputation), Object Pool (recycling pre-allocated objects), Spatial Partition (grid/quadtree for collision). Triggers on: game architecture, design patterns, FSM, state machine, command pattern, flyweight, object pool, game loop, ECS, component pattern, observer, event queue, spatial partition, dirty flag, data locality, double buffer, bytecode, type object, prototype, singleton, service locator, subclass sandbox, update method."
license: MIT
---

# Game Programming Patterns — TypeScript Edition

Reference guide with 19 battle-tested game programming patterns adapted to TypeScript. Each pattern includes intent, the problem it solves, a blueprint, and an agent note explaining when/how to apply it in modern web/TypeScript game engines (PixiJS, Phaser, Three.js wrappers, etc.).

---

## 1. Design Patterns Revisited

### 1.1 Command
**Intent:** Encapsulate a request as an object, enabling parameterization, queuing, logging, and undo/redo.

**Problem:** Direct mapping between physical input (keyboard/gamepad) and actor actions rigidly couples control logic.

**Solution:** Abstract `Command` interface with `execute(actor)`. Input handlers invoke dynamic commands.

```typescript
interface GameActor { jump(): void; }

interface Command {
  execute(actor: GameActor): void;
  undo?(): void;
}

class JumpCommand implements Command {
  execute(actor: GameActor): void { actor.jump(); }
}

class InputHandler {
  private buttonX: Command;
  constructor(command: Command) { this.buttonX = command; }

  handleInput(actor: GameActor, isXPressed: boolean): void {
    if (isXPressed) this.buttonX.execute(actor);
  }
}
```

**Agent note:** Essential for decoupling input mapping from actions. Foundation for replay systems and command history (undo/redo).

---

### 1.2 Flyweight
**Intent:** Minimize memory usage by sharing as much data as possible with similar objects.

**Problem:** Thousands of entity instances (trees, particles) with identical data saturate RAM and degrade cache.

**Solution:** Split into **intrinsic state** (shared, constant, heavy) and **extrinsic state** (per-instance, light — position, orientation).

```typescript
class TreeModel {
  constructor(private mesh: Uint8Array, private texture: string) {}
  draw(x: number, y: number, z: number): void { /* render */ }
}

class Tree {
  constructor(
    private x: number, private y: number, private z: number,
    private model: TreeModel // shared reference
  ) {}
  draw(): void { this.model.draw(this.x, this.y, this.z); }
}
```

**Agent note:** Ideal for massive rendering systems and static item databases. In JS/TS, reduces GC pressure by minimizing unique properties in memory.

---

### 1.3 Observer
**Intent:** One-to-many dependency so that when one object changes state, all dependents are notified automatically.

**Problem:** Tight coupling of secondary systems (achievements, audio, UI) to core physics/mechanics code.

**Solution:** Subject maintains a list of `Observer` interface references and notifies them iteratively without knowing concrete implementations.

```typescript
interface Observer {
  onNotify(entity: Entity, event: GameEvent): void;
}

class Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void { this.observers.push(observer); }
  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter(o => o !== observer);
  }
  notify(entity: Entity, event: GameEvent): void {
    for (const o of this.observers) o.onNotify(entity, event);
  }
}
```

**Agent note:** Watch for memory leaks — always unsubscribe observers from destroyed entities. In TS/web, can use EventEmitters or callbacks, but the risk of dangling references remains.

---

### 1.4 Prototype
**Intent:** Specify object types using a prototypical instance and create new objects by cloning it.

**Problem:** Avoid separate factory classes per entity type (`GhostSpawner`, `DemonSpawner`).

**Solution:** Implement `clone()` on the entity interface/class to copy state at runtime.

```typescript
abstract class Monster {
  abstract clone(): Monster;
}

class Ghost extends Monster {
  constructor(private health: number, private speed: number) { super(); }
  clone(): Monster { return new Ghost(this.health, this.speed); }
}

class Spawner {
  constructor(private prototype: Monster) {}
  spawnMonster(): Monster { return this.prototype.clone(); }
}
```

**Agent note:** Naturally suited to JS/TS's prototypal inheritance model. Also works well with structured cloning and `Object.assign`.

---

### 1.5 Singleton
**Intent:** Ensure a class has a single instance and provide a global access point.

**Problem:** Unrestricted access to global managers (FileSystem, Audio, Memory) creates hidden dependencies.

**Solution:** Private constructor + static accessor controlling unique initialization.

```typescript
class FileSystem {
  private static _instance: FileSystem | null = null;
  private constructor() {}

  static get instance(): FileSystem {
    if (!this._instance) this._instance = new FileSystem();
    return this._instance;
  }

  readFile(path: string): void { /* logic */ }
}
```

**Agent note:** Common anti-pattern. In modern TS, prefer exporting a constant instance from a module or using Dependency Injection instead of classic Singleton classes.

---

### 1.6 State
**Intent:** Allow an object to alter its behavior when its internal state changes. The object appears to change class.

**Problem:** Unmanageable giant `switch`/`if-else` blocks controlling character behavior based on animation states (`isJumping`, `isDucking`).

**Solution:** Create a `State` interface encapsulating state-dependent behavior. Delegate execution to the active state instance within a Finite State Machine (FSM).

```typescript
interface HeroState {
  handleInput(hero: Hero, input: string): void;
  update(hero: Hero): void;
}

class Hero {
  private state: HeroState;
  constructor(initialState: HeroState) { this.state = initialState; }

  handleInput(input: string): void { this.state.handleInput(this, input); }
  update(): void { this.state.update(this); }
  changeState(newState: HeroState): void { this.state = newState; }
}

class DuckingState implements HeroState {
  handleInput(hero: Hero, input: string): void {
    if (input === 'RELEASE_DOWN') { /* hero.changeState(new StandingState()); */ }
  }
  update(hero: Hero): void { /* per-frame ducking logic */ }
}
```

**Agent note:** Extensible to Concurrent State Machines, Hierarchical FSMs, or Pushdown Automata for animation trees and AI behavior.

---

## 2. Sequencing Patterns

### 2.1 Double Buffer
**Intent:** Sequence operations so the result appears atomically and smoothly, avoiding visible intermediate states.

**Problem:** Modifying a 2D or graphic state directly exposes inconsistent transition states or tearing.

**Solution:** Maintain two buffers: **Current Buffer** (read) and **Next Buffer** (write). Swap after the cycle completes.

```typescript
class Framebuffer {
  private pixels: string[][] = [
    new Array(1000).fill('black'),
    new Array(1000).fill('black')
  ];
  private currentBuffer: number = 0;

  flip(): void { this.currentBuffer = 1 - this.currentBuffer; }
  getReadBuffer(): string[] { return this.pixels[this.currentBuffer]; }
  getWriteBuffer(): string[] { return this.pixels[1 - this.currentBuffer]; }
}
```

**Agent note:** Essential not just for canvas/WebGL, but also for synchronous cellular automata or physics where reading and writing on the same structure corrupts results.

---

### 2.2 Game Loop
**Intent:** Decouple game-time progression from hardware speed and user input.

**Problem:** Execution speed and frame count fluctuate based on browser load in web/async environments.

**Solution:** Process input, accumulate elapsed time in fixed steps (Fixed Update), and render with interpolation.

```typescript
class GameLoop {
  private previousTime: number = 0;
  private lag: number = 0;
  private readonly MS_PER_UPDATE = 1000 / 60; // ~16.67ms

  start(): void {
    this.previousTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    const elapsed = currentTime - this.previousTime;
    this.previousTime = currentTime;
    this.lag += elapsed;

    this.processInput();

    while (this.lag >= this.MS_PER_UPDATE) {
      this.updatePhysics();
      this.lag -= this.MS_PER_UPDATE;
    }

    this.render(this.lag / this.MS_PER_UPDATE);
    requestAnimationFrame(this.loop.bind(this));
  }

  private processInput(): void {}
  private updatePhysics(): void {}
  private render(alpha: number): void {}
}
```

**Agent note:** In PixiJS v8, use `app.ticker.add((t) => { ... t.deltaTime ... })` instead of raw `requestAnimationFrame`. The fixed timestep + interpolation pattern is standard for deterministic physics in web games.

---

### 2.3 Update Method
**Intent:** Simulate a collection of independent objects by telling each to process its behavior one frame at a time.

**Problem:** The main engine cannot hardcode individual behavior for hundreds of disparate entity types (projectiles, enemies, VFX).

**Solution:** Maintain a dynamic entity collection behind a common interface with `update()`. The engine iterates over this set each logical cycle.

```typescript
interface Entity {
  update(deltaTime: number): void;
  isDestroyed(): boolean;
}

class World {
  private entities: Entity[] = [];

  update(deltaTime: number): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.isDestroyed()) {
        this.entities.splice(i, 1);
      } else {
        entity.update(deltaTime);
      }
    }
  }
}
```

**Agent note:** Reverse iteration (or deferred queues) is mandatory in JS/TS to prevent index misalignment when an entity destroys itself inside its own `update()` call.

---

## 3. Behavioral Patterns

### 3.1 Bytecode
**Intent:** Encode behavior as instructions for an embedded virtual machine, enabling safe, fast, and isolated game logic modification.

**Problem:** Allowing complex modding or designer changes without risking malicious code injection or engine crashes.

**Solution:** Define a compact `OpCode` enum and process linear byte/number arrays simulating a register or stack-based VM.

```typescript
enum OpCode {
  INST_SET_HEALTH = 0x01,
  INST_PLAY_SOUND = 0x02,
}

class VirtualMachine {
  interpret(bytecode: Uint8Array): void {
    let i = 0;
    while (i < bytecode.length) {
      const instruction = bytecode[i];
      switch (instruction) {
        case OpCode.INST_SET_HEALTH: {
          const amount = bytecode[++i];
          this.setHealth(amount);
          break;
        }
        case OpCode.INST_PLAY_SOUND: {
          const soundId = bytecode[++i];
          this.playSound(soundId);
          break;
        }
      }
      i++;
    }
  }

  private setHealth(amount: number): void {}
  private playSound(id: number): void {}
}
```

**Agent note:** Replaces unsafe `eval()` in JS environments. Provides absolute behavioral isolation (computational sandbox) for user-created mods.

---

### 3.2 Subclass Sandbox
**Intent:** Define basic behavior in a base class using a set of operations provided by it, shielding subclasses from external coupling.

**Problem:** Hundreds of ability/powerup subclasses coupling directly to particle systems, audio, rendering, and UI.

**Solution:** Concentrate all complex integrations into `protected` methods in the abstract base class. Subclasses implement only the pure operational method (`activate()`).

```typescript
abstract class Superpower {
  protected playSound(soundId: string): void { /* controlled audio access */ }
  protected spawnParticles(type: string): void { /* controlled particle access */ }

  abstract activate(): void;
}

class SkyRocket extends Superpower {
  activate(): void {
    this.playSound('sound_explosion_loud');
    this.spawnParticles('particle_fire_trail');
  }
}
```

**Agent note:** Simplifies mass maintenance in large content teams. If a core subsystem changes, only the abstract base class signature is modified.

---

### 3.3 Type Object
**Intent:** Allow flexible definition of new "types" of classes dynamically without native language inheritance.

**Problem:** Creating a native class per subtle enemy variant explodes the subclass hierarchy.

**Solution:** Create a single structural `Breed` class containing variable data and inject it into the generic `Monster` instance.

```typescript
class Breed {
  constructor(private name: string, private maxHealth: number) {}
  getMaxHealth(): number { return this.maxHealth; }
  getName(): string { return this.name; }
}

class Monster {
  private currentHealth: number;

  constructor(private breed: Breed) {
    this.currentHealth = this.breed.getMaxHealth();
  }

  getBreedName(): string { return this.breed.getName(); }
}
```

**Agent note:** Enables direct mapping of external JSON schemas (loaded hot from a backend) into the engine's TypeScript logic, achieving full design dynamism without recompilation.

---

## 4. Decoupling Patterns

### 4.1 Component
**Intent:** Allow a single entity to span multiple domains (physics, rendering, AI, audio) without coupling them.

**Problem:** A unified `Player` class collapses under its own weight when mixing 3D rendering, rigid-body physics, and network responses.

**Solution:** Fragment the entity into decoupled logical blocks (`InputComponent`, `PhysicsComponent`). The container class (`GameObject`) acts as a lightweight forwarding manager.

```typescript
class GameObject {
  private components: Component[] = [];

  addComponent(comp: Component): void { this.components.push(comp); }

  update(): void {
    for (const component of this.components) component.update(this);
  }
}

interface Component {
  update(obj: GameObject): void;
}

class PhysicsComponent implements Component {
  update(obj: GameObject): void { /* independent positional logic */ }
}
```

**Agent note:** Direct foundation for high-performance **ECS (Entity Component System)** architectures popular in efficient web engines. In PixiJS, use `Container` as entity root and components as children with `onRender` hooks.

---

### 4.2 Event Queue
**Intent:** Decouple the sending of a message or event from the moment it is processed, handling it asynchronously or deferred.

**Problem:** Firing an instant, heavy event in response to an action blocks the main JavaScript thread, causing graphical jank.

**Solution:** Deposit requests into a sequential indexed buffer. A processor consumes the queue at a controlled rate during the frame.

```typescript
interface PlayEvent { soundId: string; volume: number; }

class AudioSystem {
  private queue: PlayEvent[] = [];
  private readonly MAX_PENDING = 32;

  playSound(soundId: string, volume: number): void {
    if (this.queue.length < this.MAX_PENDING) {
      this.queue.push({ soundId, volume });
    }
  }

  update(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) this.executeAudio(event);
    }
  }

  private executeAudio(event: PlayEvent): void { /* Web Audio API integration */ }
}
```

**Agent note:** Critical in single-threaded web environments to avoid frame-execution spikes. Also enables audio coalescing (discarding identical repeated sounds in the same microsecond).

---

### 4.3 Service Locator
**Intent:** Provide a global access point to a service without coupling users to the concrete implementation class.

**Problem:** Direct global variables break unit testing and low-level module mocking in the ecosystem.

**Solution:** Maintain a centralized store (`ServiceLocator`) indexing abstract implementations of core interfaces, enabling hot-swapping of services cleanly.

```typescript
interface AudioService { playSound(id: string): void; }

class NullAudioService implements AudioService {
  playSound(id: string): void { /* intentional no-op — silence */ }
}

class ServiceLocator {
  private static audioService: AudioService = new NullAudioService();

  static getAudio(): AudioService { return this.audioService; }

  static registerAudio(service: AudioService | null): void {
    this.audioService = service ?? new NullAudioService();
  }
}
```

**Agent note:** Excellent for stability. Registering a null service by default prevents `Cannot read property of undefined` errors when a system is invoked before initialization. Use as a decoupled alternative to Singleton.

---

## 5. Optimization Patterns

### 5.1 Data Locality
**Intent:** Accelerate operations by leveraging CPU cache architecture, organizing data contiguously in memory.

**Problem:** In high-level languages like JS/TS, object references scatter data across the heap, breaking physical cache utilization.

**Solution:** Use flat, compact structures backed by typed contiguous-memory arrays like `Float32Array` or `Int32Array` to consolidate massive numerical performance.

```typescript
class ParticleSystemContiguous {
  private data: Float32Array;
  private size: number;
  // Layout: [x0, y0, vx0, vy0, x1, y1, vx1, vy1, ...]
  private stride = 4;

  constructor(maxParticles: number) {
    this.size = maxParticles;
    this.data = new Float32Array(maxParticles * this.stride);
  }

  update(): void {
    for (let i = 0; i < this.size; i++) {
      const idx = i * this.stride;
      this.data[idx]     += this.data[idx + 2]; // posX += velX
      this.data[idx + 1] += this.data[idx + 3]; // posY += velY
    }
  }
}
```

**Agent note:** In PixiJS, this is exactly what `ParticleContainer` does internally. For custom physics or massive simulations, explicit `TypedArrays` is the only guaranteed way in web environments to emulate console-level Data Locality.

---

### 5.2 Dirty Flag
**Intent:** Avoid unnecessary expensive computations by deferring them until the result is strictly needed.

**Problem:** Recalculating hierarchical projection matrices in a node tree every frame even though nothing changed.

**Solution:** Implement a boolean flag (`isDirty`). Modifying a parent node sets the flag, forcing deferred complex math evaluation only when the final result is requested.

```typescript
class TransformNode {
  private positionX: number = 0;
  private cachedWorldMatrix: number = 0;
  private isDirty: boolean = true;

  setPosition(x: number): void {
    this.positionX = x;
    this.isDirty = true;
  }

  getWorldMatrix(): number {
    if (this.isDirty) {
      this.cachedWorldMatrix = this.positionX * 42; // expensive calc
      this.isDirty = false;
    }
    return this.cachedWorldMatrix;
  }
}
```

**Agent note:** Massively reduces redundant processing in 2D/3D graphics engines and large-scale UI layout systems. In PixiJS, `Container.getBounds()` internally uses a similar mechanism.

---

### 5.3 Object Pool
**Intent:** Optimize performance and avoid memory fragmentation by recycling pre-allocated objects instead of creating and destroying them dynamically.

**Problem:** Repeated `new Object()` calls for temporary projectiles saturate the heap, triggering intermittent GC freezes.

**Solution:** Pre-allocate a fixed array of stable latent entities. Instead of destroying them, toggle them to an inactive state ready for reuse.

```typescript
class Bullet {
  private active: boolean = false;

  init(): void { this.active = true; }
  deactivate(): void { this.active = false; }
  isActive(): boolean { return this.active; }
}

class BulletPool {
  private pool: Bullet[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) this.pool.push(new Bullet());
  }

  spawn(): Bullet | null {
    for (const bullet of this.pool) {
      if (!bullet.isActive()) {
        bullet.init();
        return bullet;
      }
    }
    return null; // Pool saturated, prevents unsafe dynamic overflow
  }
}
```

**Agent note:** **Absolutely mandatory** in web/mobile TypeScript games for particles, bullets, and enemies. The GC in browsers will cause micro-freezes without it. In PixiJS, combine with `visible` toggling for zero-allocation entity recycling.

---

### 5.4 Spatial Partition
**Intent:** Store objects organized efficiently by position in physical space to accelerate geometric and collision queries.

**Problem:** Brute-force collision checking every entity against every other costs O(N^2), unsustainable at scale.

**Solution:** Geographically group logical elements into stable 2D cells (Grids, Quadtrees). Physics queries examine only direct neighbor containers.

```typescript
interface Unit { id: string; x: number; y: number; }

class SpatialGrid {
  private cells: Map<string, Unit[]> = new Map();
  private readonly CELL_SIZE = 50;

  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.CELL_SIZE);
    const cellY = Math.floor(y / this.CELL_SIZE);
    return `${cellX},${cellY}`;
  }

  registerUnit(unit: Unit): void {
    const key = this.getKey(unit.x, unit.y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key)!.push(unit);
  }

  getNearbyUnits(x: number, y: number): Unit[] {
    return this.cells.get(this.getKey(x, y)) ?? [];
  }
}
```

**Agent note:** Enables smooth performance in complex 2D physics simulations, AI attack-range calculations, and camera frustum culling. In PixiJS, use this for custom collision when `CullerPlugin` handles rendering culling separately.

---

## Quick Reference — When to use each pattern

| Situation | Pattern |
|---|---|
| Remappable controls, replay, undo/redo | **Command** |
| Thousands of identical entities | **Flyweight** |
| Decoupled system notifications (achievements, audio) | **Observer** |
| Spawning entity variants without factories | **Prototype** |
| Global service with lazy init (prefer DI) | **Singleton** / **Service Locator** |
| Character behavior, animation state control | **State** (FSM) |
| Atomic frame transitions, cellular automata | **Double Buffer** |
| Decoupled time step, physics determinism | **Game Loop** |
| Per-frame entity behavior iteration | **Update Method** |
| Safe mod/scripting sandbox | **Bytecode** |
| Mass content creation with protected APIs | **Subclass Sandbox** |
| Data-driven entity variants from JSON | **Type Object** |
| Multi-domain entity composition | **Component** (ECS) |
| Deferred audio/IO processing | **Event Queue** |
| Cache-friendly massive simulations | **Data Locality** (TypedArrays) |
| Avoiding redundant transform recalculations | **Dirty Flag** |
| Recycling bullets, particles, enemies | **Object Pool** |
| Efficient collision detection at scale | **Spatial Partition** |
