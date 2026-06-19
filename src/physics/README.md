# Sistema de Colisiones AABB

Motor de colisiones AABB con agrupacion estilo Phaser Arcade, integrado al ECS del proyecto.

## Arquitectura

```
GAME LOOP
  InputSystem   -> lee input, escribe Velocity
  MovementSystem -> aplica Velocity a Transform
  CollisionSystem -> construye snapshots -> PhysicsWorld.step() -> sincroniza Transform
  RenderSystem  -> sincroniza Transform a Sprites

CollisionSystem depende de:
  PhysicsWorld (reglas + engine)
    └── AABBUtils  (fase estrecha, interseccion/resolucion)
```

## Modulos

| Archivo | Responsabilidad |
|---------|----------------|
| `types.ts` | Tipos compartidos: `CollisionGroup`, `CollisionRule`, `ColliderSnapshot`, `CollisionPair` |
| `AABBUtils.ts` | Funciones puras: `aabbIntersects`, `resolveOverlap`, `centerAABB` |
| `PhysicsWorld.ts` | Motor principal: registro de reglas grupo-vs-grupo, deteccion por fuerza bruta filtrada, resolucion y callbacks. |
| `index.ts` | Barrel exports. |

### ECS complementario (fuera de `physics/`)

| Archivo | Rol |
|---------|-----|
| `ecs/types.ts` | `ColliderData` (componente) + `ComponentType.Collider` |
| `ecs/components/ColliderComponent.ts` | Factory `createCollider()` con defaults |
| `ecs/systems/CollisionSystem.ts` | Sistema ISystem que puentea el ECS con `PhysicsWorld` |

## Conceptos clave

### ColliderData (componente ECS)

```typescript
interface ColliderData {
  width: number;    // ancho del AABB
  height: number;   // alto del AABB
  isStatic: boolean; // true = no se mueve al resolver (paredes, suelo)
  group: number;    // grupo de colision (0 por defecto)
  enabled: boolean; // false = deshabilitado sin destruir la entidad
  onCollide?: (self: number, other: number) => void; // callback individual
}
```

El AABB se genera centrado en `Transform.x, Transform.y` mediante `centerAABB()`.

### Grupos de colision (`CollisionGroup`)

Un `CollisionGroup` es un `number`. Agrupa entidades para que compartan reglas de colision sin necesidad de registrar cada par individualmente. Convencion recomendada:

```typescript
const GROUPS = { PLAYER: 1, WALL: 2, ENEMY: 3, BULLET: 4 } as const;
```

### Reglas de colision (`PhysicsWorld`)

Se registran sobre `PhysicsWorld` antes de iniciar el game loop:

```typescript
const physics = new PhysicsWorld(cellSize?: number);

// collider: detecta Y resuelve el solapamiento
physics.collider(GROUP_A, GROUP_B, callback?);

// overlap: solo detecta, NO resuelve (ideal para sensores, balas)
physics.overlap(GROUP_A, GROUP_B, callback?);
```

Las reglas son bidireccionales: `collider(1, 2)` cubre tanto `1 vs 2` como `2 vs 1`.

### Flujo por frame (`PhysicsWorld.step`)

1. **Fase ancha** (fuerza bruta filtrada): itera todos los pares unicos de `ColliderSnapshot`. Con N<60 entidades el overhead de un spatial grid supera el beneficio.
2. **Fase estrecha** (`aabbIntersects`): para cada par candidato, verifica interseccion AABB exacta.
3. **Match de regla**: busca si existe una regla para `(snapshotA.group, snapshotB.group)`.
4. **Resolucion** (`resolveOverlap`): si `processOverlap === true`:
   - Static vs static: no se resuelve.
   - Dynamic vs static: solo se desplaza el dinamico.
   - Dynamic vs dynamic: ambos se desplazan la mitad del solapamiento.
   - Elige el eje de menor penetracion (eje X o Y).
5. **Callbacks** (`flushCallbacks`): dispara los callbacks de regla registrados.

### Callbacks por entidad (`onCollide`)

Ademas de los callbacks por regla, cada `ColliderData` puede tener su propio `onCollide`. Se invoca por cada par donde la entidad participo. Util para efectos locales (sonido, tint, particulas).

## Uso

### 1. Crear PhysicsWorld y registrar reglas

```typescript
import { PhysicsWorld } from "./physics";

const physics = new PhysicsWorld();
physics
  .collider(1, 2)                          // PLAYER vs WALL (resuelve, sin callback)
  .collider(1, 3, (a, b) => {             // PLAYER vs ENEMY (resuelve + callback)
    console.log(`damage: ${a} hit ${b}`);
  })
  .overlap(4, 3, (bullet, enemy) => {     // BULLET vs ENEMY (solo detecta)
    destroyEnemy(enemy);
    destroyBullet(bullet);
  });
```

### 2. Agregar CollisionSystem al World

```typescript
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem(physics)); // despues de MovementSystem
world.addSystem(new RenderSystem());
```

### 3. Crear entidades con collider

```typescript
import { ComponentType, createCollider, createTransform } from "./ecs";

// Estatico (pared)
world.createEntity()
  .with(ComponentType.Transform, createTransform({ x: 400, y: 0 }))
  .with(ComponentType.Collider, createCollider({
    width: 800, height: 20, isStatic: true, group: 2
  }))
  .build();

// Dinamico (jugador)
world.createEntity()
  .with(ComponentType.Transform, createTransform({ x: 300, y: 200 }))
  .with(ComponentType.Velocity, createVelocity())
  .with(ComponentType.Collider, createCollider({
    width: 32, height: 32, group: 1,
    onCollide: (self, other) => console.log(`entity ${self} touched ${other}`),
  }))
  .with(ComponentType.InputControlled, {})
  .build();
```

### 4. Destruir

```typescript
physics.clearRules();  // limpia reglas
// PhysicsWorld no tiene mas estado que las reglas. La grilla se recrea cada frame.
```

## Optimizacion

- **Fuerza bruta con N bajo**: para escenas con <80 entidades colisionables (ej. Arkanoid con ~60), la fuerza bruta O(N^2) es mas rapida que el overhead de un spatial hash. Se conserva el sistema simple sin grilla.
- **Paquetes de 16 bits**: si en el futuro se reintroduce un spatial grid, la clave de par usaba `(entityA << 16) | entityB` para deduplicar en un `Set`. Asume que no hay mas de 65535 entidades activas.
- **Sin GC pressure**: los snapshots se crean cada frame como objetos nuevos. Para escenas con >1000 colliders, considerar pooling de snapshots.

## Limitaciones actuales

- Solo AABB (sin rotacion de colliders). La rotacion en `Transform` se ignora para colisiones.
- Sin fisica de gravedad, friccion o rebote (bounce). Solo resolucion de solapamiento por empuje.
- Sin capas de colision ni mascaras binarias. Solo grupos numericos con reglas explicitas.
- Sin consultas espaciales publicas (raycast, overlapCircle, etc.).
