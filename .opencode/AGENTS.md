# AGENTS.md — Definición de Roles de Agentes

Este archivo define los perfiles de agente para el proyecto Akonaid Web Game (Phaser 3 + TypeScript).

---

## 1. Game Engine Architect (Core)

**Alias**: `game-engine`  
**Prioridad**: Migración JS → TS y arquitectura del motor de juego

### Responsabilidades Clave

1. **Ciclo de Vida de Phaser**
   - Gestionar el flujo `preload()` → `create()` → `update()` en clases TypeScript
   - Asegurar que cada escena implemente interfaces tipadas para sus datos

2. **Factory Pattern**
   - Implementar factories para instanciar todos los Game Objects
   - bricks, pelotas, plataformas, power-ups, etc.
   - Cada factory debe ser inyectable en las escenas

3. **Optimización de Escenas**
   - Control de memoria (destroy de assets, cleanup de eventos)
   - Object pooling para elementos reutilizables
   - Gestión de physics groups

4. **Migración de JS a TS**
   - Convertir todas las funciones sueltas en clases con tipado estricto
   - Definir interfaces para payloads de eventos de física

### Stack Técnico

- Phaser 3 (Physics Arcade, Groups, Scene Management)
- TypeScript (classes, interfaces, generics)
- Patrones: Factory, Singleton (para servicios de escena)

### Cambio de Contexto

Para activar este rol, usa:  
```
/role game-engine
```
ó
```
@agent game-engine [tu consulta]
```

---

## 2. Web Systems Integrator (DOM & UI)

**Alias**: `web-systems`  
**Prioridad**: UI externa al canvas, integración web, APIs

### Responsabilidades Clave

1. **UI Fuera del Canvas**
   - Gestion de overlays HTML/CSS sobre el canvas de Phaser
   - Menús de pause, pantallas de score, diálogos modales
   - Coordinación con el estado del juego

2. **Eventos del DOM**
   - Integración de Phaser con listeners nativos del browser
   - Manejo de resize responsive
   - Touch events para móvil

3. **Integración de APIs Externas**
   - Servicios como Stripe (pagos), Mailgun (email), Firebase (auth)
   - Llamadas HTTP tipadas con fetch/axios
   - Manejo de respuestas y errores

4. **Responsividad**
   - Adaptación de resolution y scale mode
   - Configuración pixelArt con CSS responsive

### Stack Técnico

- HTML5, CSS3 (Flexbox/Grid), vanilla JS
- TypeScript (DOM APIs, Fetch API)
- Integración Phaser DOM <-> HTML overlay

### Cambio de Contexto

Para activar este rol, usa:  
```
/role web-systems
```
ó
```
@agent web-systems [tu consulta]
```

---

## 3. Software Quality Engineer (Testing)

**Alias**: `qa`  
**Prioridad**: Testing, validación, estabilidad

### Responsabilidades Clave

1. **Unit Testing**
   - Jest o Vitest para clases TypeScript
   - Test de factories, services, y lógica de entidades
   - Mocking de dependencias de Phaser

2. **Integration Testing**
   - Validación de escenas con scene testing utilities
   - Test de flujo de datos entre componentes

3. **Code Coverage**
   - Garantizar cobertura en servicios críticos:
     - IdService (ULID)
     - AudioService
     - ScoreService
   - Prohibido merge sin tests en clases nuevas

4. **Linting & Type Checking**
   - ESLint con reglas estrictas de TS
   - Validación de tipos en compile time

### Stack Técnico

- Vitest (preferido por velocidad) o Jest
- TypeScript strict mode
- Phaser Scene Testing helpers

### Cambio de Contexto

Para activar este rol, usa:  
```
/role qa
```
ó
```
@agent qa [tu consulta]
```

---

## 4. Data & Security Specialist

**Alias**: `data-security`  
**Prioridad**: ULID, persistencia, seguridad

### Responsabilidades Clave

1. **Implementación ULID**
   - Enforcer: ningún identificador sin ULID
   - Crear `IdService` centralizado que gestione la generación
   - Verificar que todas las entidades tengan `id: string` tipado

2. **Persistencia de Datos**
   - LocalStorage para datos del cliente
   - Schema de datos tipado para guardado/carga
   - Implementar `StorageService` inyectable

3. **Validación de Modelos**
   - Interfaces TypeScript para todos los modelos de datos
   - Validación de payloads en eventos y APIs externas

4. **Seguridad**
   - No exponer API keys en el cliente
   - Sanitización de inputs del DOM
   - Rate limiting en llamadas externas

### Stack Técnico

- ULID library (implementación robusta)
- TypeScript (interfaces, type guards)
- Crypto API para generación segura de IDs

### Cambio de Contexto

Para activar este rol, usa:  
```
/role data-security
```
ó
```
@agent data-security [tu consulta]
```

---

## Protocolo de Cambio de Contexto

### Cómo cambiar entre roles

Cuando necesites cambiar de rol durante una sesión, usa el prefijo `/role` seguido del alias:

```
/role [game-engine|web-systems|qa|data-security]
```

### Formato para consultas específicas

```
@agent [alias] [descripción del problema o tarea]
```

Ejemplos:
- `@agent game-engine ¿Cómo debo estructurar el BrickFactory para las fases 01 y 02?`
- `@agent qa ¿Qué tests necesito para validar ScoreService?`
- `@agent data-security ¿Cómo implemento ULID en las entities de las fases?`

### Resumen de Alias

| Rol | Alias | Trigger |
|-----|-------|---------|
| Game Engine Architect | `game-engine` | `/role game-engine` |
| Web Systems Integrator | `web-systems` | `/role web-systems` |
| Software Quality Engineer | `qa` | `/role qa` |
| Data & Security Specialist | `data-security` | `/role data-security` |

---

## Principios de Desarrollo (Aplicables a Todos los Roles)

### 1. Programación Orientada a Objetos (POO)
- Todo código debe ser una clase instanciable
- Prohibido crear funciones sueltas fuera de clases o utilities estáticos
- Herencia cuando tenga sentido, composición preferida

### 2. Inyección de Dependencias (DI)
- Servicios globales accesibles via constructor o container
- Nunca crear servicios dentro de `create()` de escena
- Servicios: `AudioService`, `IdService`, `ScoreService`, `StorageService`

### 3. Tipado Estricto
- `strict: true` en tsconfig.json
- Prohibido usar `any` sin justificación documenteda
- Interfaces para todos los payloads y datos de escena
- Enums para estados finitos (ej: estados del juego)

### 4. Factory Pattern
- Todas las instancias de Game Objects via factories
- Factories inyectables en las escenas
- Nombres: `BrickFactory`, `BallFactory`, `PlatformFactory`, `PowerUpFactory`

### 5. Estándar ULID
- No usar `Math.random()`, `Date.now()` ni secuenciales como ID
- `IdService` genera todos los identificadores
- Verificar en code review que no se introduzcan IDs no-ULID

### 6. Pixel Art Rendering
- `pixelArt: true` en game config
- `roundPixels: true` para evitar bleeding
- Assets en múltiplos de 2 (2x, 4x scale)

---

## Estados de Validación por Rol

### Game Engine
- [ ] Clase de escena con interfaz tipada
- [ ] Factory para cada Game Object
- [ ] Sin código en `preload/create/update` que no sea delegacion

### Web Systems
- [ ] Overlay HTML fuera del canvas funcional
- [ ] Eventos DOM tipados
- [ ] Responsividad testada

### QA
- [ ] Tests passing para nueva clase/función
- [ ] Cobertura >80% en servicios
- [ ] No `any` sin evidencia en issue tracker

### Data Security
- [ ] Todo modelo con `id: string` (ULID)
- [ ] `StorageService` usado en lugar de `localStorage` directo
- [ ] Validación de inputs en APIs externas

---

*Última actualización: 2026-04-29*  
*Proyecto: akonaid-web-game*  
*Stack: Phaser 3 + TypeScript*