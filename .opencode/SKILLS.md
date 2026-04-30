# SKILLS.md — Estándares Técnicos de Codificación

**Proyecto**: Akonaid Web Game  
**Stack**: Phaser 3 + TypeScript  
**Versión**: 1.0.0  
**Última actualización**: 2026-04-29

---

## 1. Core de Lenguaje (TypeScript & Browser)

### 1.1 Tipado Estricto

**Regla**: Prohibición absoluta del uso de `any`.

**Por qué**: El uso de `any` elimina la verificación de tipos en TypeScript, comprometiendo la seguridad del código y la capacidad de refactoring. En un proyecto de gaming donde múltiples desarrolladores interactúan con el estado del juego, perder el tipado estático es inaceptable.

**Snippet**:
```typescript
// ❌ PROHIBIDO
function processData(data: any): any {
    return data.value;
}

// ✅ CORRECTO
interface PowerUpData {
    id: string;
    type: PowerUpType;
    position: { x: number; y: number };
}

function processData(data: PowerUpData): number {
    return data.position.x;
}
```

---

### 1.2 Interfaces vs Types

**Regla**: Priorizar `interface` para definir la forma de objetos y contratos de clases. Usar `type` solo para uniones o alias simples.

**Por qué**: Las `interface` ofrecen mejor capacidad de herencia (`extends`), mejor mensaje de error en errores de tipo, y son más declarativas para contratos de clase. Los `type` son superiores para combinaciones de tipos existentes.

**Snippet**:
```typescript
// ✅ CORRECTO - Interface para objetos y contratos
interface IBrickConfig {
    key: string;
    frameQuantity: number;
    gridAlign: GridAlignConfig;
}

interface IBrick extends Phaser.Physics.Arcade.Image {
    getPoints(): number;
}

// ✅ CORRECTO - Type para uniones o alias
type BrickType = 'white' | 'orange' | 'cyan' | 'green';
type SceneState = 'loading' | 'playing' | 'paused' | 'gameover';
```

---

### 1.3 Arrow Functions

**Regla**: Priorizar Arrow Functions (`const name = () => {}`) para callbacks de Phaser y métodos que se pasen como referencias.

**Por qué**: Las Arrow Functions preservan el contexto de `this` léxico, eliminando la necesidad de `.bind(this)` en callbacks de Phaser (como `pointerdown`, `update`, etc.). Esto reduce errores y mejora la legibilidad.

**Snippet**:
```typescript
// ❌ EVITAR
class GameScene extends Phaser.Scene {
    create() {
        this.playButton.on('pointerdown', function() {
            this.scene.start('game'); // 'this' undefined
        });
    }
}

// ✅ CORRECTO
class GameScene extends Phaser.Scene {
    create() {
        this.playButton.on('pointerdown', () => {
            this.scene.start('game'); // 'this' preservado
        });
    }
}
```

---

### 1.4 DOM & CSS

**Regla**: Manipulation del DOM via TypeScript con tipado seguro. CSS modular y separado de la lógica del juego.

**Por qué**: Phaser renderiza en un canvas, pero la UI overlay (menús, HUDs, diálogos) debe existir en el DOM. Mantener CSS modular facilita el mantenimiento y evita conflictos de estilos.

**Snippet**:
```typescript
// ✅ TypeScript DOM manipulation tipado
const overlay = document.getElementById('pause-overlay') as HTMLElement;
overlay.style.display = 'flex';

// ✅ CSS modular (pause-menu.css)
.pause-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: rgba(0, 0, 0, 0.7);
    z-index: 100;
}
```

---

## 2. Arquitectura de Software

### 2.1 POO con Clases

**Regla**: Todo el código debe implementarse como clases TypeScript. Ninguna función suelta fuera de una clase o utility static.

**Por qué**: Phaser está diseñado alrededor del concepto de Game Objects y Scenes basadas en clases. Seguir POO estricta mantiene coherencia con el framework y facilita la escalabilidad del proyecto.

**Snippet**:
```typescript
// ✅ CORRECTO - Clase bien estructurada
export class LiveCounter {
    private readonly initialLives: number;
    private livesSprites: Phaser.Physics.Arcade.Group | null = null;
    private deathSound: Phaser.Sound.BaseSound | null = null;

    constructor(
        private readonly scene: Phaser.Scene,
        initialLives: number
    ) {
        this.initialLives = initialLives;
    }

    public preload(): void {
        this.scene.load.image('lives', 'assets/images/lives.png');
        this.scene.load.audio('death', 'assets/sfx/death.ogg');
    }

    public create(): void {
        this.deathSound = this.scene.sound.add('death');
        // ...
    }
}
```

---

### 2.2 Factory Pattern

**Regla**: Uso obligatorio de Factories para instanciar cualquier GameObject, enemigo o entidad del juego.

**Por qué**: Las Factories centralizan la creación de objetos, permitiendo:
- Configuración consistente de propiedades
- Reutilización de lógica de instanciación
- Facilitar testing con factories mockeables
- Control del ciclo de vida de los objetos

**Snippet**:
```typescript
// ✅ CORRECTO - BrickFactory
export class BrickFactory {
    constructor(private readonly scene: Phaser.Scene) {}

    public create(
        key: string,
        x: number,
        y: number,
        frame?: number
    ): Phaser.Physics.Arcade.Image {
        const brick = this.scene.physics.add.image(x, y, key);
        brick.setImmovable(true);
        brick.body.allowGravity = false;

        if (frame !== undefined) {
            brick.setFrame(frame);
        }

        return brick;
    }

    public createGroup(
        keys: string[],
        gridConfig: GridAlignConfig
    ): Phaser.Physics.Arcade.StaticGroup {
        return this.scene.physics.add.staticGroup({
            key: keys,
            frameQuantity: gridConfig.width,
            gridAlign: gridConfig
        });
    }
}
```

---

### 2.3 Inyección de Dependencias

**Regla**: Los servicios globales (Audio, Score, Id, Storage) deben inyectarse en los constructores o métodos init, nunca crearse dentro de `create()`.

**Por qué**: La DI permite:
- Testing unitario con mocks de servicios
- Cambiar implementaciones sin modificar consumidores
- Ciclo de vida controlado de servicios globales
- Desacoplamiento real entre componentes

**Snippet**:
```typescript
// ✅ CORRECTO - DI en constructor
export class GameScene extends Phaser.Scene {
    private platform: Phaser.Physics.Arcade.Sprite;
    private ball: Phaser.Physics.Arcade.Image;
    private readonly audioService: AudioService;
    private readonly scoreService: ScoreService;
    private readonly idService: IdService;

    constructor(
        private readonly gameConfig: GameConfig,
        audioService: AudioService,
        scoreService: ScoreService,
        idService: IdService
    ) {
        super({ key: 'Game' });
        this.audioService = audioService;
        this.scoreService = scoreService;
        this.idService = idService;
    }

    init(): void {
        this.score = 0;
    }
}
```

---

### 2.4 ULID para Identificadores

**Regla**: Uso mandatorio de ULID para todos los IDs de entidades, registros y objetos. Prohibido usar `Date.now()`, `Math.random()` o secuenciales.

**Por qué**: ULID ofrece:
- Orden lexicográfico (indexable en bases de datos)
- 128 bits de entropía (colisiones prácticamente imposibles)
- No expone información secuencial o temporal
- Más rápido que UUID v4

**Snippet**:
```typescript
import { ulid } from 'ulid';

// ✅ CORRECTO
interface Entity {
    id: string;
}

class PowerUp implements Entity {
    public readonly id: string;

    constructor(private readonly type: PowerUpType) {
        this.id = ulid(); // Genera ID único
    }
}

// ❌ PROHIBIDO
this.id = Date.now().toString();
this.id = Math.random().toString(36);
this.id = `${this.scene.count}`; // Secuencial
```

---

## 3. Phaser 3 Specifics

### 3.1 Configuración Pixel Art

**Regla**: Toda configuración de Phaser debe usar `pixelArt: true` y `roundPixels: true` para mantener el estilo retro.

**Por qué**: Sin estas opciones, Phaser aplica blur a los assets pixel art durante el escalado, arruinando la estética del juego. `roundPixels` evita el sangrado de píxeles (bleeding) entre sprites adyacentes.

**Snippet**:
```typescript
// ✅ CORRECTO - Config pixel art
const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 350,
    height: 750,
    parent: 'game',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(gameConfig);
```

---

### 3.2 Extensión de Clases Nativas de Phaser

**Regla**: Crear componentes personalizados extendiendo las clases nativas de Phaser (Sprite, Image, Group) y usar Factories para registrarlos.

**Por qué**: Extender clases de Phaser permite encapsular lógica específica del juego en componentes reutilizables. Las Factories abstraen la instanciación, permitiendo cambiar implementaciones sin afectar consumers.

**Snippet**:
```typescript
// ✅ CORRECTO - Componente extendido de Phaser
export class PlayerPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'playerPlatform');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false;
        this.body.setImmovable(true);
        this.body.setCollideWorldBounds(true);
    }

    public playAnimation(key: string): void {
        this.anims.play(key, true);
    }
}

// ✅ CORRECTO - Factory con registro en GameObjectFactory
export class PlatformFactory {
    constructor(private readonly scene: Phaser.Scene) {
        scene.sys.make('gameobjects');
    }

    public create(
        x: number,
        y: number,
        textureKey: string
    ): PlayerPlatform {
        return new PlayerPlatform(this.scene, x, y);
    }
}
```

---

## 4. Snippet de Referencia: Factory + DI + Arrow Functions

El siguiente snippet demuestra la combinación de todos los patrones en una clase de juego:

```typescript
import Phaser from 'phaser';
import { ulid } from 'ulid';

// ============== INTERFACES ==============
interface IBrickConfig {
    id: string;
    type: BrickType;
    position: { x: number; y: number };
}

interface GridAlignConfig {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    x: number;
    y: number;
}

// ============== SERVICES (DI) ==============
interface IAudioService {
    play(key: string): void;
    stop(key: string): void;
}

interface IScoreService {
    add(points: number): void;
    get(): number;
}

interface IIdService {
    generate(): string;
}

// ============== FACTORY ==============
class BrickFactory {
    constructor(
        private readonly scene: Phaser.Scene,
        private readonly idService: IIdService
    ) {}

    public create(config: IBrickConfig): Phaser.Physics.Arcade.Image {
        const brick = this.scene.physics.add.image(
            config.position.x,
            config.position.y,
            `${config.type}Brick`
        );
        brick.setImmovable(true);
        brick.body.allowGravity = false;

        // Extender con ID usando ULID
        brick.setData('entityId', config.id);
        brick.setData('brickType', config.type);

        return brick;
    }

    public createGroup(
        types: BrickType[],
        gridConfig: GridAlignConfig
    ): Phaser.Physics.Arcade.StaticGroup {
        return this.scene.physics.add.staticGroup({
            key: types.map(t => `${t}Brick`),
            frameQuantity: gridConfig.width,
            gridAlign: gridConfig
        });
    }
}

// ============== COMPONENT ==============
class BrickManager {
    private readonly bricks: Map<string, Phaser.Physics.Arcade.Image> = new Map();
    private readonly factory: BrickFactory;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly audioService: IAudioService,
        private readonly scoreService: IScoreService,
        private readonly idService: IIdService
    ) {
        this.factory = new BrickFactory(scene, idService);
    }

    public createBrick(type: BrickType, x: number, y: number): string {
        const id = this.idService.generate();
        const config: IBrickConfig = {
            id,
            type,
            position: { x, y }
        };

        const brick = this.factory.create(config);
        this.bricks.set(id, brick);

        return id;
    }

    public destroyBrick(id: string): void {
        const brick = this.bricks.get(id);
        if (brick) {
            this.audioService.play('block-hit');
            brick.destroy();
            this.bricks.delete(id);
            this.scoreService.add(10);
        }
    }

    public configureCollision(
        ball: Phaser.Physics.Arcade.Image,
        callback: (ball: Phaser.Physics.Arcade.Image, brick: Phaser.Physics.Arcade.Image) => void
    ): void {
        this.scene.physics.add.collider(
            ball,
            Array.from(this.bricks.values()),
            (b, brick) => callback(b as Phaser.Physics.Arcade.Image, brick as Phaser.Physics.Arcade.Image),
            undefined,
            this
        );
    }
}

// ============== SCENE ==============
class GameScene extends Phaser.Scene {
    private ball: Phaser.Physics.Arcade.Image;
    private brickManager: BrickManager;

    // Inyección via constructor (simplificado para demo)
    constructor() {
        super({ key: 'Game' });
        
        const audioService: IAudioService = new AudioServiceImpl(this);
        const scoreService: IScoreService = new ScoreServiceImpl();
        const idService: IIdService = { generate: () => ulid() };

        this.brickManager = new BrickManager(this, audioService, scoreService, idService);
    }

    create(): void {
        // Arrow function para callback
        this.brickManager.configureCollision(this.ball, (ball, brick) => {
            const id = brick.getData('entityId') as string;
            this.brickManager.destroyBrick(id);
            this.checkWinCondition();
        });
    }

    private readonly checkWinCondition = (): void => {
        if (this.brickManager.getRemaining() === 0) {
            this.scene.start('Congratulations');
        }
    };
}
```

---

## Checklist de Compliance

### Antes de commitear, verificar:

- [ ] Sin uso de `any` en el código
- [ ] Interfaces usadas para contratos, types para uniones
- [ ] Arrow functions en callbacks de Phaser
- [ ] CSS en archivos modulares separados
- [ ] Todas las clases sin lógica suelta fuera de métodos
- [ ] Factories para instanciar Game Objects
- [ ] Servicios inyectados, no creados dentro de `create()`
- [ ] IDs generados via ULID, no secuenciales
- [ ] Config con `pixelArt: true` y `roundPixels: true`
- [ ] Clases extendidas de Phaser para componentes custom

---

*Este documento es vinculante para todos los contributors.*  
*Para cambios, usar el proceso de PR con code review obligatorio.*