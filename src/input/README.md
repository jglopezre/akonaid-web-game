# Input System

Sistema de input polimórfico y desacoplado para el motor del juego. Sigue los patrones **Command** (mapping reconfigurable) y **Observer** (eventos vía `EventEmitter`).

---

## Estructura

```
input/
  InputAction.ts           # Vocabulario canónico de acciones
  IInputSource.ts          # Contrato polimórfico para fuentes de input
  KeyboardInputSource.ts   # Captura eventos de teclado (keydown/keyup)
  JoystickInputSource.ts   # Captura Gamepad API (polling por frame)
  CompositeInputSource.ts  # Agrupa múltiples fuentes bajo una misma interfaz
  InputManager.ts          # Orquestador: mapea raw input → acciones → eventos
  index.ts                 # Barrel export
```

---

## Clases

### `InputAction` (enum) — `InputAction.ts`

Vocabulario de las 10 acciones disponibles. Es el contrato que consumen las escenas y sistemas de juego.

| Valor | Uso típico |
|-------|-----------|
| `Action1` — `Action6` | Acciones de juego (saltar, disparar, interactuar, etc.) |
| `Left`, `Right`, `Up`, `Down` | Movimiento direccional |

---

### `IInputSource` (interfaz) — `IInputSource.ts`

Contrato que toda fuente de input debe implementar. No depende de PixiJS ni de `EventEmitter`.

```typescript
interface IInputSource {
  start(): void;                               // Activar captura
  stop(): void;                                // Desactivar captura
  update(): void;                              // Polling por frame (gamepad)
  addListener(cb: InputSourceCallback): void;   // Suscribir a eventos raw
  removeListener(cb: InputSourceCallback): void;
}
```

**`InputSourceEvent`**: `{ key: string; pressed: boolean }` — formato canónico que toda fuente emite.
- `key`: identificador hardware (`"KeyW"`, `"button0"`, `"axis1+"`)
- `pressed`: `true` en press, `false` en release

---

### `KeyboardInputSource` — `KeyboardInputSource.ts`

Fuente **event-driven**. No requiere `update()`.

- Escucha `keydown`/`keyup` en `window`
- Filtra `e.repeat` — solo emite en transiciones reales
- Mantiene un `Set<string>` de teclas presionadas para evitar duplicados
- En `stop()`, emite release de todas las teclas pendientes (limpieza)

**Ejemplo de eventos emitidos:**
```
{ key: "KeyW",     pressed: true  }
{ key: "KeyW",     pressed: false }
{ key: "Space",    pressed: true  }
```

---

### `JoystickInputSource` — `JoystickInputSource.ts`

Fuente **poll-only**. Requiere que `update()` sea llamado cada frame (lo hace `InputManager` → `SceneManager` → ticker).

- Lee `navigator.getGamepads()` en cada `update()`
- Deadzone configurable para ejes analógicos (default `0.15`)
- Compara estado actual vs frame anterior — solo emite transiciones
- Si el gamepad se desconecta, emite release de todos los botones/ejes

**Constructor:**
```typescript
new JoystickInputSource({ deadzone: 0.15, pollGamepadIndex: 0 })
```

**Mapeo de hardware a keys:**
| Hardware | Key emitida |
|----------|------------|
| `buttons[0]` presionado | `"button0"` |
| `axes[0]` > deadzone | `"axis0+"` |
| `axes[0]` < -deadzone | `"axis0-"` |
| `axes[1]` > deadzone | `"axis1+"` |
| `axes[1]` < -deadzone | `"axis1-"` |

Además, escucha los eventos `gamepadconnected` y `gamepaddisconnected` y loguea en consola la conexión/desconexión del mando.

---

### `CompositeInputSource` — `CompositeInputSource.ts`

Agrupa múltiples fuentes de input bajo una misma interfaz `IInputSource`. Permite usar teclado, joystick, touch y cualquier otra fuente simultáneamente sin modificar `InputManager`.

- Implementa `IInputSource`: `InputManager` no distingue entre una fuente única y un composite.
- Usa un **bridge callback** interno que reenvía eventos de todas las sub-fuentes a los listeners registrados.
- `start()` / `stop()` / `update()` se delegan a todas las sub-fuentes.
- `addListener()` / `removeListener()` solo subscribe el bridge a las sub-fuentes cuando hay al menos un listener activo (inicialización perezosa).

**Patrón aplicado:** Composite — trata un grupo de fuentes como una sola.

**Ejemplo de uso:**
```typescript
const composite = new CompositeInputSource(
  new KeyboardInputSource(),
  new JoystickInputSource({ deadzone: 0.15 }),
);
const inputManager = new InputManager(composite);
inputManager.setMapping({
  KeyW: InputAction.Up,
  "axis1-": InputAction.Up,     // mismo mapping, distintas fuentes
});
```

**Flujo de eventos en el composite:**
```
KeyboardInputSource → emite { key: "KeyW", pressed: true }
       │
       ▼
  bridge callback
       │
       ▼
  CompositeInputSource.listeners
       │
       ▼
  InputManager.sourceCallback → handleInput()
```

El mismo flujo se repite para `JoystickInputSource` u otras fuentes agregadas. `InputManager` recibe eventos de todas sin saber que provienen de fuentes distintas.

---

### `InputManager` — `InputManager.ts`

Orquestador central. Recibe un `IInputSource` inyectado y expone dos modos de consumo:

#### Modo polling (movimiento continuo)

```typescript
if (inputManager.isPressed(InputAction.Left)) {
  player.x -= speed * delta;
}
```

#### Modo eventos (acciones discretas)

```typescript
inputManager.onActionStart(InputAction.Action1, () => player.jump());
inputManager.onActionEnd(InputAction.Action1, () => player.land());
```

#### API completa

| Método | Descripción |
|--------|------------|
| `setMapping(mapping)` | Configura la tabla `hw key → InputAction`. Soporta remapping en runtime |
| `getMapping()` | Devuelve el mapping actual (útil para serializar a settings) |
| `isPressed(action)` | Retorna `true` si la acción está activa en este momento |
| `onActionStart(action, cb)` | Suscribe callback al evento de presión |
| `onActionEnd(action, cb)` | Suscribe callback al evento de liberación |
| `offAction(action, cb)` | Desuscribe callback de ambos eventos |
| `start()` | Activa el InputManager y su fuente |
| `stop()` | Desactiva el InputManager y su fuente |
| `update()` | Delega a `source.update()` (necesario para gamepad) |
| `destroy()` | Limpia listeners, mapping y estado interno |

#### Flujo interno

```
IInputSource emite { key: "Space", pressed: true }
       │
       ▼
InputManager.handleInput()
  - Busca "Space" en mapping → InputAction.Action1
  - Compara con estado anterior (evita duplicados)
  - Actualiza Map<InputAction, boolean>
  - Emite "action1:start" vía EventEmitter
```

---

## Integración

El `InputManager` se instancia en `Game.ts` (composition root) con un `CompositeInputSource` para soportar teclado y joystick simultáneos:

```typescript
const compositeSource = new CompositeInputSource(
  new KeyboardInputSource(),
  new JoystickInputSource(),
);
const inputManager = new InputManager(compositeSource);
inputManager.setMapping({
  KeyW: InputAction.Up,
  ArrowUp: InputAction.Up,
  "axis1-": InputAction.Up,
  Space: InputAction.Action1,
  "button0": InputAction.Action1,
});
inputManager.start();

const sceneManager = new SceneManager(stage, screen, ticker, inputManager);
```

Las escenas acceden vía `sceneManager.getInputManager()`.

---

## Cambiar de fuente en runtime

```typescript
const joystickSource = new JoystickInputSource({ deadzone: 0.2 });
const joystickManager = new InputManager(joystickSource);
joystickManager.setMapping({
  'button0': InputAction.Action1,
  'button1': InputAction.Action2,
  'axis0-':  InputAction.Left,
  'axis0+':  InputAction.Right,
  'axis1-':  InputAction.Up,
  'axis1+':  InputAction.Down,
});
```

---

## Patrones aplicados

| Patrón | Dónde |
|--------|-------|
| **Command** | `InputManager.mapping`: desacopla hardware de acciones, reconfigurable en runtime |
| **Observer** | `EventEmitter` en `InputManager`: sistemas de juego se suscriben sin acoplarse |
| **Strategy** | `IInputSource`: intercambiar teclado/joystick sin cambiar `InputManager` |
| **Composite** | `CompositeInputSource`: agrupa múltiples fuentes de input como una sola |
| **Dependency Injection** | `InputManager` recibe `IInputSource`; `SceneManager` recibe `InputManager` |
