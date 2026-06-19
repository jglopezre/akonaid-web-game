# ARkONAID — PixiJS v8 Edition

> **ARkONAID** es un juego tipo Arkanoid/Breakout originalmente desarrollado en [Phaser 3](https://phaser.io/) por [@jglopezre](https://github.com/jglopezre). Esta rama contiene la **migración completa a PixiJS v8** con arquitectura ECS, sistema de físicas AABB, manejo de input unificado y gestión de escenas modular.

---

## 🎮 Estado del Proyecto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Motor gráfico | ✅ Listo | PixiJS v8.8.1 con WebGL/WebGPU auto |
| Arquitectura | ✅ Listo | ECS (Entity Component System) custom |
| Input | ✅ Listo | Teclado + Gamepad vía `InputManager` |
| Física | ✅ Listo | AABB con fuerza bruta (SpatialGrid eliminado por bajo N) |
| Escenas | ✅ Listo | `SceneManager` con stack de escenas |
| Audio | ✅ Listo | `@pixi/sound` integrado vía `AudioManager` singleton |
| Responsive | ✅ Listo | Layout vertical 350×750, CSS scaling mobile/desktop |
| Gameplay core | ✅ Listo | Plataforma, bola, bricks, fases, vidas, puntuación |
| Escenas finales | ✅ Listo | `GameOverScene` y `CongratulationsScene` |
| Power-ups | ⏳ Pendiente | Cápsulas que caen de bricks (spritesheet listo) |
| Testing | ⏳ Pendiente | Tests unitarios para `BallSystem` y lógica de fases |
| Balance | ⏳ Pendiente | Ajustes de velocidad y ángulos de rebote |

> Ver [Issues del proyecto](https://github.com/jglopezre/akonaid-web-game/issues) para el estado detallado de cada tarea.

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
  - `Sprite` — referencia a `Pixi.Sprite` / `AnimatedSprite`
  - `Collider` — AABB, grupo de colisión, estático/dinámico
  - `InputControlled` — marcador para entidades controladas por input
  - `Ball` — marcador para la entidad bola (usado por `BallSystem`)
  - `Brick` — tipo (`normal` | `hard`) y puntos
- **Sistemas:**
  - `InputSystem` — mapea input a velocidad de la plataforma
  - `MovementSystem` — aplica velocidad al transform
  - `BallSystem` — física custom de Arkanoid (rebotes en paredes, plataforma, bricks)
  - `RenderSystem` — sincroniza `Transform` → `Sprite.position/rotation/scale`

### Física

- **AABB** (Axis-Aligned Bounding Box) para colisiones.
- **`PhysicsWorld`** gestiona reglas de colisión por grupos (`collider` / `overlap`).
- **Sin `SpatialGrid`:** para < 60 entidades en 350×750, el overhead de broad-phase supera el beneficio. Fuerza bruta O(N²) directamente (~1.800 comparaciones/frame, sub-milisegundo en V8).
- **`BallSystem`** reemplaza `CollisionSystem` para el gameplay de Arkanoid: en lugar de resolver overlap por empuje, calcula eje de penetración e invierte velocidad (comportamiento de rebote correcto para una bola).

### Escenas

- **`IScene`** contrato: `init`, `create`, `update`, `pause`, `resume`, `destroy`.
- **`SceneManager`** administra stack de escenas, ciclo de vida y transiciones.
- Escenas actuales:
  - `ArkanoidScene` — gameplay principal (plataforma, bola, bricks, HUD)
  - `GameOverScene` — pantalla de derrota con botón restart
  - `CongratulationsScene` — pantalla de victoria con botón restart
  - `BunnyScene` — demo técnico del ECS (legacy, desregistrada de Game.ts)

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

> `@pixi/sound` requiere carga de assets vía `Assets.load()` para archivos OGG. El manifest de sonidos se precarga en `Game.ts` antes de iniciar la primera escena.

---

## 📁 Estructura de Carpetas

```
src/
  ecs/           # Motor ECS (World, EntityManager, Componentes, Sistemas)
  physics/       # Física AABB, resolución de colisiones (SpatialGrid eliminado)
  input/         # InputManager, fuentes de input (teclado, gamepad)
  scenes/        # Escenas del juego (IScene, SceneManager, ArkanoidScene...)
  levels/        # Layouts de fases (Phase01, Phase02)
  audio/         # AudioManager singleton (@pixi/sound)
  Game.ts        # Bootstrap de Application y orquestación
  main.ts        # Entry point
public/
  assets/        # Sprites, sonidos, música (importados del original Phaser 3)
```

---

## 🎯 Roadmap de Migración

### Completado
1. ✅ **Scaffold base** — PixiJS v8 + Vite + TypeScript strict ([Milestone v0.1.0](https://github.com/jglopezre/akonaid-web-game/milestone/1))
2. ✅ **ECS + Física** — Entidades, componentes, AABB, `BallSystem` custom
3. ✅ **Input + Escenas** — Teclado, gamepad, SceneManager
4. ✅ **Audio** — `@pixi/sound` para SFX y BGM
5. ✅ **Responsive** — Layout vertical mobile-first con letterboxing desktop
6. ✅ **Gameplay Arkanoid** — Plataforma, bola, bricks, fases, vidas, puntuación
7. ✅ **Escenas finales** — GameOver, Congratulations

### Pendiente ([Milestone v0.3.0](https://github.com/jglopezre/akonaid-web-game/milestone/3))
- ⏳ **Power-ups** — Cápsulas que caen de bricks
- ⏳ **Testing** — Tests unitarios para BallSystem y lógica de fases
- ⏳ **Balance** — Ajustes de velocidad y ángulos de rebote

---

## 📊 Gestión del Proyecto

- **[Issues](https://github.com/jglopezre/akonaid-web-game/issues)** — 10 cerradas, 5 abiertas
- **[Milestones](https://github.com/jglopezre/akonaid-web-game/milestones)**
  - `v0.1.0-pixi-scaffold` — Scaffold base ✅
  - `v0.2.0-gameplay-core` — Core gameplay Arkanoid ✅
  - `v0.3.0-polish` — Power-ups, testing, balance ⏳
- **Project Board** — `Arkonaid Game` (pendiente de creación; requiere autorizar scope `project` en `gh auth`)

---

## 🙏 Créditos

- **Autor original (Phaser 3):** [Javier G. López](https://github.com/jglopezre) — *ARkONAID* (2020-2021)
- **Migración a PixiJS v8:** Proyecto continuado sobre el scaffold ECS PixiJS
- **Assets originales:** Conservados de la rama `legacy` (imágenes, sonidos OGG, música)

---

## 📜 Licencia

Ver archivo `LICENSE` en la raíz del repositorio.
