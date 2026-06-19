# ARkONAID — PixiJS v8 Edition

> **ARkONAID** es un juego tipo Arkanoid/Breakout originalmente desarrollado en [Phaser 3](https://phaser.io/) por [@jglopezre](https://github.com/jglopezre). Esta rama contiene la **migración completa a PixiJS v8** con arquitectura ECS, sistema de físicas AABB, manejo de input unificado y gestión de escenas modular.

---

## 🎮 Estado del Proyecto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Motor gráfico | ✅ Listo | PixiJS v8.8.1 con WebGL/WebGPU auto |
| Arquitectura | ✅ Listo | ECS (Entity Component System) custom |
| Input | ✅ Listo | Teclado + Gamepad vía `InputManager` |
| Física | ✅ Listo | AABB + SpatialGrid (colisiones por grupos) |
| Escenas | ✅ Listo | `SceneManager` con stack de escenas |
| Audio | 🔄 En progreso | Integración de `@pixi/sound` |
| Gameplay | 🔄 En progreso | Port de mecánicas Arkanoid desde Phaser |
| Responsive | 🔄 En progreso | Optimizado para mobile vertical + desktop |

---

## 🌿 Estructura de Ramas

| Rama | Propósito | Contenido |
|------|-----------|-----------|
| `main` | Release estable | Código PixiJS listo para producción |
| `dev` | Desarrollo activo | Nuevas features y refactorización |
| `legacy` | Código original | Juego Phaser 3 completo con historial Git intacto |

> **Nota:** `legacy` preserva los 14 commits originales del proyecto Phaser. Sirve como referencia de assets, lógica de niveles y balanceo.

---

## 🏷️ Tags

- **`v0.1.0-pixi-scaffold`** — Estado base del scaffold PixiJS v8 (ECS, Input, Physics, SceneManager). Úsalo como punto de partida para forks de nuevos proyectos PixiJS.

```bash
git clone https://github.com/jglopezre/akonaid-web-game.git
cd akonaid-web-game
git checkout v0.1.0-pixi-scaffold
```

---

## 🏗️ Arquitectura

### ECS (Entity Component System)

El núcleo del juego se construye sobre un ECS ligero custom:

- **`World`** — Registro de entidades, componentes y sistemas.
- **`EntityBuilder`** — API fluida para ensamblar entidades.
- **Componentes actuales:**
  - `Transform` — posición, rotación, escala
  - `Velocity` — velocidad lineal y angular
  - `Sprite` — referencia a `Pixi.Sprite`
  - `Collider` — AABB, grupo de colisión, estático/dinámico
  - `InputControlled` — marcador para entidades controladas por input
- **Sistemas:**
  - `InputSystem` — mapea input a velocidad
  - `MovementSystem` — aplica velocidad al transform
  - `CollisionSystem` — ejecuta `PhysicsWorld.step()` + callbacks
  - `RenderSystem` — sincroniza `Transform` → `Sprite.position/rotation`

### Física

- **AABB** (Axis-Aligned Bounding Box) para colisiones.
- **`PhysicsWorld`** gestiona reglas de colisión por grupos (`collider` / `overlap`).
- **`SpatialGrid`** para broad-phase (cell size configurable; actualmente 128px).
- Resolución de overlap con distribución 50/50 entre cuerpos dinámicos.

### Escenas

- **`IScene`** contrato: `init`, `create`, `update`, `pause`, `resume`, `destroy`.
- **`SceneManager`** administra stack de escenas, ciclo de vida y transiciones.
- Escenas actuales:
  - `BunnyScene` — demo técnico del ECS (será reemplazada por `ArkanoidScene`).

### Input

- **`InputManager`** centraliza input de teclado y gamepad.
- **`CompositeInputSource`** combina múltiples fuentes con prioridad.
- Mapeo declarativo de teclas/axis a `InputAction` (Up, Down, Left, Right, Action1-6).

---

## 🚀 Cómo correr

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo
npm run dev

# 3. Build de producción
npm run build
```

> Requiere **Node.js ≥ 18** y **Vite ≥ 6**.

---

## 📦 Dependencias

```json
{
  "pixi.js": "^8.8.1",
  "@pixi/sound": "^6.0.0",
  "eventemitter3": "^5.0.4"
}
```

---

## 📁 Estructura de Carpetas

```
src/
  ecs/           # Motor ECS (World, EntityManager, Componentes, Sistemas)
  physics/       # Física AABB, SpatialGrid, resolución de colisiones
  input/         # InputManager, fuentes de input (teclado, gamepad)
  scenes/        # Escenas del juego (IScene, SceneManager, BunnyScene...)
  Game.ts        # Bootstrap de Application y orquestación
  main.ts        # Entry point
public/
  assets/        # Sprites, sonidos, música
```

---

## 🎯 Roadmap de Migración

1. ✅ **Scaffold base** — PixiJS v8 + Vite + TypeScript strict
2. ✅ **ECS + Física** — Entidades, componentes, AABB, colisiones
3. ✅ **Input + Escenas** — Teclado, gamepad, SceneManager
4. 🔄 **Audio** — `@pixi/sound` para SFX y BGM
5. 🔄 **Responsive** — Layout vertical mobile-first con letterboxing desktop
6. ⏳ **Gameplay Arkanoid** — Plataforma, bola, bricks, niveles, vidas, power-ups
7. ⏳ **Escenas finales** — GameOver, Congratulations, menús

---

## 🙏 Créditos

- **Autor original (Phaser 3):** [Javier G. López](https://github.com/jglopezre) — *ARkONAID* (2020-2021)
- **Migración a PixiJS v8:** Proyecto continuado sobre el scaffold ECS PixiJS
- **Assets originales:** Conservados de la rama `legacy` (imágenes, sonidos OGG, música)

---

## 📜 Licencia

Ver archivo `LICENSE` en la raíz del repositorio.
