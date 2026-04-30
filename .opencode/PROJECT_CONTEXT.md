# Project Context - Akonaid Web Game

## Stack Tecnológico
- **Framework**: Phaser 3
- **Lenguaje**: TypeScript (migración desde JavaScript)
- **Módulo**: ES6

## Arquitectura

### Principios
- **POO Estricta**: Todo el código debe implementarse como clases TypeScript.
- **Factory Pattern**: Uso exclusivo de Factories para instanciar Game Objects.
- **Inyección de Dependencias**: Servicios globales accesibles via dependency injection.

### Estructura de Carpetas Propuesta
```
src/
├── factories/          # Factory classes para instanciar Game Objects
│   ├── BrickFactory.ts
│   ├── BallFactory.ts
│   ├── PlatformFactory.ts
│   └── PowerUpFactory.ts
├── services/           # Servicios globales (inyección de dependencias)
│   ├── AudioService.ts
│   ├── ScoreService.ts
│   ├── StorageService.ts (para APIs externas/persistencia)
│   └── IdService.ts    # Implementación ULID
├── scenes/            # Scenas de Phaser
│   ├── Game.ts
│   ├── GameOver.ts
│   ├── Congratulations.ts
│   └── phases/
│       ├── PhaseManager.ts
│       ├── PhaseBase.ts
│       ├── Phase01.ts
│       └── Phase02.ts
├── entities/          # Entidades de dominio (si las hay)
├── types/              # Tipos y interfaces TypeScript
│   ├── event-payloads.ts
│   └── scene-data.ts
├── utils/              # Utilidades
└── main.ts             # Entry point
```

## Estándares de Datos

### Identificadores
- **PROHIBIDO**: Uso de IDs secuenciales o UUIDs genéricos.
- **OBLIGATORIO**: Implementación de ULID para todos los identificadores de entidad.

## Estética y Resolución

### Estilo Visual
- **Pixel Art / Retro**

### Resolución
- **Base**: ~320x240px (actual: 350x750, re-escalar según necesidad)
- **Configuración de Renderizado**:
  - `pixelArt: true`
  - `roundPixels: true`

## Reglas de Migración

### Conversión JS → TypeScript
1. Convertir todas las funciones JavaScript a clases TypeScript.
2. Implementar interfaces para payloads de eventos.
3. Tipado estricto para propiedades de escenas.

### Tipado de Escenas
```typescript
interface SceneData {
  score: number;
  lives: number;
  // ... outras propiedades
}
```

### Event Payloads
```typescript
interface BrickCollisionPayload {
  brick: Phaser.Physics.Arcade.Image;
  ball: Phaser.Physics.Arcade.Image;
}
```

## Estado de Migración
- [x] Creado PROJECT_CONTEXT.md
- [ ] Configurar tsconfig.json
- [ ] Implementar servicios base (AudioService, IdService con ULID)
- [ ] Migrar componentes a TypeScript
- [ ] Crear Factories
- [ ] Migrar escenas
- [ ] Configurar pipeline de build