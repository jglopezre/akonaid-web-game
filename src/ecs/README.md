# ECS — Entity Component System

Sistema ECS puro para el desacoplamiento de la logica de juego del motor grafico (PixiJS). Cada escena contiene su propio `World`, que orquesta entidades, componentes y sistemas.

## Arquitectura en 3 capas

```
┌─────────────────────────────────────────────────────┐
│                      World                           │
│  ┌───────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ EntityManager │  │  Stores    │  │  Systems   │ │
│  │  (IDs + mask) │  │ (data pura)│  │  (logica)  │ │
│  └───────┬───────┘  └─────┬──────┘  └─────┬──────┘ │
│          │                │               │         │
│   Entity = number    Component =     System =       │
│   (identificador)    { x, y, ... }   update(dt)     │
└─────────────────────────────────────────────────────┘
```

| Capa | Que es | Ejemplo |
|------|--------|---------|
| **Entity** | Un `number` (ID). Sin datos ni logica. | `1`, `2`, `42` |
| **Component** | Datos puros (interfaces). Sin metodos. | `{ x: 100, y: 200 }` |
| **System** | Logica que itera entidades con ciertos componentes. | `MovementSystem: pos += vel * dt` |

---

## ComponentType y mascaras de bits

Cada tipo de componente recibe un bit unico (potencia de 2). Cada entidad tiene una mascara (`componentMask`) que es el OR de los bits de los componentes que posee.

```typescript
enum ComponentType {
  Transform        = 1 << 0, // 1  = 0b0001
  Velocity         = 1 << 1, // 2  = 0b0010
  Sprite           = 1 << 2, // 4  = 0b0100
  InputControlled  = 1 << 3, // 8  = 0b1000
}
```

Un sistema declara su `requiredMask` y consulta al `World` por entidades que coincidan:

```typescript
// Solo entidades con Transform Y Velocity (mascara = 1 | 2 = 3)
movementSystem.requiredMask = ComponentType.Transform | ComponentType.Velocity;
// → 0b0011

// Una entidad con Transform + Velocity + Sprite (mascara = 1|2|4 = 7 = 0b0111)
// Cumple: (0b0111 & 0b0011) === 0b0011 → true
```

### Para que sirve cada componente

| Componente | Bit | Datos | Proposito |
|------------|-----|-------|-----------|
| `Transform` | `1` | `{ x, y, rotation, scaleX, scaleY }` | Posicion y transformacion en el mundo |
| `Velocity` | `2` | `{ vx, vy, angularVelocity }` | Velocidad (px/s) y rotacion por frame |
| `Sprite` | `4` | `{ sprite: Sprite }` | Referencia al `Sprite` de PixiJS (puente al renderer) |
| `InputControlled` | `8` | `{}` | Tag: marca la entidad como controlada por input |

---

## World

El `World` es el contenedor central. Cada escena instancia uno.

```typescript
import { World, ComponentType } from "./ecs";

const world = new World();

// 1. Registrar sistemas (orden = orden de ejecucion)
world.addSystem(new InputSystem(inputManager, 300));
world.addSystem(new MovementSystem());
world.addSystem(new RenderSystem());

// 2. Crear entidades con fluent API
const player = world.createEntity()
  .with(ComponentType.Transform, { x: 400, y: 300, rotation: 0, scaleX: 1, scaleY: 1 })
  .with(ComponentType.Velocity, { vx: 0, vy: 0, angularVelocity: 0.01 })
  .with(ComponentType.Sprite, { sprite: bunnySprite })
  .with(ComponentType.InputControlled, {})
  .build(); // retorna el ID (number)

// 3. Game loop
app.ticker.add((ticker) => {
  world.update(ticker.deltaTime);
});

// 4. Cleanup
world.destroy(); // destruye sistemas, limpia stores y entidades
```

### API del World

| Metodo | Descripcion |
|--------|-------------|
| `addSystem(system)` | Registra un sistema. Llama `system.init(this)`. Orden de registro = orden de ejecucion. |
| `createEntity()` | Retorna un `EntityBuilder` para construir entidades con fluent API. |
| `destroyEntity(id)` | Elimina la entidad y todos sus componentes de los stores. |
| `getComponent<T>(id, type)` | Obtiene los datos de un componente de una entidad. `undefined` si no existe. |
| `setComponent<T>(id, type, data)` | Asigna/sobrescribe un componente. Actualiza la mascara automaticamente. |
| `removeComponent(id, type)` | Elimina un componente de la entidad. |
| `queryEntities(mask)` | Retorna `number[]` con IDs de entidades que tienen TODOS los bits de `mask`. |
| `update(deltaTime)` | Ejecuta `system.update(deltaTime)` en cada sistema registrado, en orden. |
| `destroy()` | Destruye todos los sistemas, limpia stores y el `EntityManager`. |

### EntityBuilder (fluent API)

```typescript
const id = world.createEntity()
  .with(ComponentType.Transform, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 })
  .with(ComponentType.Velocity, { vx: 100, vy: 0, angularVelocity: 0.5 })
  .build();
```

Cada llamada a `.with()` tiene type-safety via overloads: TypeScript fuerza el tipo de datos correcto segun el `ComponentType`.

---

## ISystem — contrato de sistema

```typescript
interface ISystem {
  readonly requiredMask: number;       // mascara de componentes que necesita
  init(world: World): void;            // llamado por world.addSystem()
  update(deltaTime: number): void;     // llamado cada frame por world.update()
  destroy(): void;                     // cleanup al destruir el World
}
```

### Crear un sistema nuevo

```typescript
import type { World } from "../World";
import type { ISystem } from "./ISystem";
import { ComponentType } from "../types";

export class GravitySystem implements ISystem {
  readonly requiredMask = ComponentType.Transform | ComponentType.Velocity;

  private world: World | null = null;

  init(world: World): void {
    this.world = world;
  }

  update(deltaTime: number): void {
    if (!this.world) return;
    const dt = deltaTime / 60;

    const entities = this.world.queryEntities(this.requiredMask);
    for (const entity of entities) {
      const vel = this.world.getComponent<VelocityData>(entity, ComponentType.Velocity);
      if (vel) {
        vel.vy += 9.8 * dt; // gravedad
      }
    }
  }

  destroy(): void {
    this.world = null;
  }
}
```

### Agregar un nuevo tipo de componente

1. Agregar el bit al enum `ComponentType` en `types.ts`:
   ```typescript
   Health = 1 << 4, // 16
   ```

2. Definir la interfaz de datos en `types.ts`:
   ```typescript
   export interface HealthData {
     current: number;
     max: number;
   }
   ```

3. Crear el archivo del componente en `components/HealthComponent.ts` (opcional, para factories y constantes):
   ```typescript
   export const HEALTH = ComponentType.Health;
   export function createHealth(overrides?: Partial<HealthData>): HealthData {
     return { current: 100, max: 100, ...overrides };
   }
   ```

---

## Sistemas existentes

### InputSystem
- **requiredMask:** `Transform | InputControlled`
- **Constructor:** `new InputSystem(inputManager: InputManager, speed: number)`
- **Logica:** Lee `InputManager.isPressed()` para las 4 direcciones y asigna `vx/vy` en `VelocityComponent` de las entidades que tengan el tag `InputControlled`.

### MovementSystem
- **requiredMask:** `Transform | Velocity`
- **Logica:** Aplica velocidad a posicion: `pos += vel * (deltaTime / 60)`. Tambien aplica `angularVelocity` a `rotation`.

### RenderSystem
- **requiredMask:** `Transform | Sprite`
- **Logica:** Sincroniza `TransformComponent` → `Sprite` de PixiJS (`position`, `rotation`, `scale`). Es el unico sistema que toca PixiJS. Si manana cambias a Three.js, solo cambias este sistema.

---

## Flujo por frame

```
Ticker callback (SceneManager)
  │
  └── world.update(ticker.deltaTime)
        │
        ├── InputSystem.update()       ← InputManager → Velocity
        ├── MovementSystem.update()    ← Velocity → Transform
        ├── RenderSystem.update()      ← Transform → Sprite (PixiJS)
        └── ...otros sistemas...
              │
              └── PixiJS renderiza el stage automaticamente despues
```

Los sistemas se ejecutan en el orden en que se registraron con `world.addSystem()`. El orden importa: `InputSystem` debe correr antes que `MovementSystem`, y `MovementSystem` antes que `RenderSystem`.

---

## Integracion con PixiJS

PixiJS es tratado **solo como un sistema de renderizado mas**. La unica dependencia de PixiJS en el ECS esta en:

1. `SpriteComponent` — almacena una referencia a `Sprite` de PixiJS.
2. `RenderSystem` — sincroniza `TransformComponent` → propiedades del `Sprite`.
3. El `Container` de la escena — el `Sprite` se agrega manualmente al `container` de la escena en `create()` para que PixiJS lo incluya en el render.

El resto del ECS (`EntityManager`, `World`, `MovementSystem`, `InputSystem`) es completamente agnostico a PixiJS y funciona con TypeScript puro.

### Patron de uso en una escena

```typescript
export class MiEscena implements IScene {
  readonly container: Container;
  private world: World;

  async init(context: ISceneContext): Promise<void> {
    this.world = new World();
    this.world.addSystem(new InputSystem(this.inputManager, 300));
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(new RenderSystem());
  }

  async create(): Promise<void> {
    const texture = await Assets.load("/assets/bunny.png");
    const sprite = new Sprite(texture);
    this.container.addChild(sprite); // ← PixiJS necesita esto para renderizar

    this.world.createEntity()
      .with(ComponentType.Transform, { x: 400, y: 300, rotation: 0, scaleX: 1, scaleY: 1 })
      .with(ComponentType.Velocity, { vx: 0, vy: 0, angularVelocity: 0.01 })
      .with(ComponentType.Sprite, { sprite })
      .with(ComponentType.InputControlled, {})
      .build();
  }

  update(ticker: Ticker): void {
    this.world.update(ticker.deltaTime); // una sola linea
  }

  destroy(): void {
    this.world.destroy();
    this.container.destroy({ children: true });
  }
}
```

---

## Estructura de archivos

```
src/ecs/
├── types.ts                  # ComponentType enum, interfaces de datos
├── EntityManager.ts          # CRUD de entidades, mascaras, queries
├── World.ts                  # Orquestador central + EntityBuilder
├── components/
│   ├── TransformComponent.ts # Factory + constante para Transform
│   ├── VelocityComponent.ts  # Factory + constante para Velocity
│   ├── SpriteComponent.ts    # Factory + constante para Sprite
│   ├── InputControlledComponent.ts
│   └── index.ts              # Barrel export
├── systems/
│   ├── ISystem.ts            # Contrato de sistema
│   ├── InputSystem.ts        # Input → Velocity
│   ├── MovementSystem.ts     # Velocity → Transform
│   ├── RenderSystem.ts       # Transform → PixiJS Sprite
│   └── index.ts              # Barrel export
└── index.ts                  # API publica del modulo
```
