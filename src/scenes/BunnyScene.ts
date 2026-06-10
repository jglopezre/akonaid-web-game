import { Assets, Container, Graphics, Sprite, Ticker } from "pixi.js";
import type { InputManager } from "../input/InputManager";
import type { IScene, ISceneContext } from "./IScene";
import {
  World,
  ComponentType,
  InputSystem,
  MovementSystem,
  RenderSystem,
  CollisionSystem,
} from "../ecs";
import { PhysicsWorld } from "../physics";

const COLLISION_GROUPS = {
  PLAYER: 1,
  WALL: 2,
  OBSTACLE: 3,
} as const;

export class BunnyScene implements IScene {
  readonly name = "bunny";
  readonly container: Container;

  private readonly inputManager: InputManager;
  private world: World | null = null;
  private physicsWorld: PhysicsWorld | null = null;
  private centerX = 0;
  private centerY = 0;
  private screenWidth = 0;
  private screenHeight = 0;

  constructor(_parent: Container, inputManager: InputManager) {
    this.inputManager = inputManager;
    this.container = new Container();
    this.container.label = "bunny-scene";
  }

  async init(context: ISceneContext): Promise<void> {
    this.centerX = context.screen.width / 2;
    this.centerY = context.screen.height / 2;
    this.screenWidth = context.screen.width;
    this.screenHeight = context.screen.height;

    this.physicsWorld = new PhysicsWorld();
    this.physicsWorld
      .collider(COLLISION_GROUPS.PLAYER, COLLISION_GROUPS.WALL)
      .collider(COLLISION_GROUPS.PLAYER, COLLISION_GROUPS.OBSTACLE, (a, b) => {
        console.log(`Player ${a} hit obstacle ${b}`);
      });

    this.world = new World();
    this.world.addSystem(new InputSystem(this.inputManager, 300));
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(new CollisionSystem(this.physicsWorld));
    this.world.addSystem(new RenderSystem());
  }

  async create(): Promise<void> {
    const bunnyTexture = await Assets.load("/assets/bunny.png");
    this.createWalls(this.screenWidth, this.screenHeight);

    for (const obs of this.createObstacles()) {
      const g = new Graphics();
      g.rect(0, 0, obs.width, obs.height);
      g.fill({ color: 0xcc4444 });
      g.rect(0, 0, obs.width, obs.height);
      g.stroke({ color: 0x440000, width: 2 });
      g.pivot.set(obs.width / 2, obs.height / 2);
      this.container.addChild(g);

      this.world!.createEntity()
        .with(ComponentType.Transform, {
          x: obs.x,
          y: obs.y,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        })
        .with(ComponentType.Collider, {
          width: obs.width,
          height: obs.height,
          isStatic: true,
          group: obs.group,
          enabled: true,
        })
        .build();
    }

    const player = new Sprite(bunnyTexture);
    player.anchor.set(0.5);
    player.tint = 0xffffff;
    this.container.addChild(player);

    this.world!.createEntity()
      .with(ComponentType.Transform, {
        x: this.centerX,
        y: this.centerY,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      .with(ComponentType.Velocity, {
        vx: 0,
        vy: 0,
        angularVelocity: 0.01,
      })
      .with(ComponentType.Sprite, { sprite: player })
      .with(ComponentType.InputControlled, {})
      .with(ComponentType.Collider, {
        width: 26,
        height: 37,
        isStatic: false,
        group: COLLISION_GROUPS.PLAYER,
        enabled: true,
        onCollide: (_self, other) => {
          console.log(`Player collided with ${other}`);
        },
      })
      .build();

    const enemy = new Sprite(bunnyTexture);
    enemy.anchor.set(0.5);
    enemy.tint = 0xff4444;
    enemy.scale.set(0.7);
    this.container.addChild(enemy);

    this.world!.createEntity()
      .with(ComponentType.Transform, {
        x: this.centerX + 150,
        y: this.centerY,
        rotation: 0,
        scaleX: 0.7,
        scaleY: 0.7,
      })
      .with(ComponentType.Velocity, {
        vx: 120,
        vy: 80,
        angularVelocity: 0.02,
      })
      .with(ComponentType.Sprite, { sprite: enemy })
      .with(ComponentType.Collider, {
        width: 26,
        height: 37,
        isStatic: false,
        group: COLLISION_GROUPS.PLAYER,
        enabled: true,
      })
      .build();
  }

  private createWalls(
    screenW: number,
    screenH: number,
  ): { x: number; y: number; width: number; height: number; group: number }[] {
    const thickness = 20;
    const walls = [
      { x: screenW / 2, y: thickness / 2, width: screenW, height: thickness }, // top
      {
        x: screenW / 2,
        y: screenH - thickness / 2,
        width: screenW,
        height: thickness,
      }, // bottom
      {
        x: thickness / 2,
        y: screenH / 2,
        width: thickness,
        height: screenH,
      }, // left
      {
        x: screenW - thickness / 2,
        y: screenH / 2,
        width: thickness,
        height: screenH,
      }, // right
    ];

    for (const w of walls) {
      const g = new Graphics();
      g.rect(0, 0, w.width, w.height);
      g.fill({ color: 0x4488cc });
      g.pivot.set(w.width / 2, w.height / 2);
      g.x = w.x;
      g.y = w.y;
      this.container.addChild(g);

      this.world!.createEntity()
        .with(ComponentType.Transform, {
          x: w.x,
          y: w.y,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        })
        .with(ComponentType.Collider, {
          width: w.width,
          height: w.height,
          isStatic: true,
          group: COLLISION_GROUPS.WALL,
          enabled: true,
        })
        .build();
    }

    return walls.map((w) => ({ ...w, group: COLLISION_GROUPS.WALL }));
  }

  private createObstacles(): {
    x: number;
    y: number;
    width: number;
    height: number;
    group: number;
  }[] {
    return [
      {
        x: 300,
        y: 300,
        width: 80,
        height: 40,
        group: COLLISION_GROUPS.OBSTACLE,
      },
      {
        x: 500,
        y: 200,
        width: 60,
        height: 120,
        group: COLLISION_GROUPS.OBSTACLE,
      },
      {
        x: 700,
        y: 400,
        width: 100,
        height: 50,
        group: COLLISION_GROUPS.OBSTACLE,
      },
    ];
  }

  update(ticker: Ticker): void {
    this.world?.update(ticker.deltaTime);
  }

  pause(): void {
    this.container.visible = false;
  }

  resume(): void {
    this.container.visible = true;
  }

  destroy(): void {
    this.physicsWorld?.clearRules();
    this.world?.destroy();
    this.world = null;
    this.physicsWorld = null;
    this.container.destroy({ children: true });
  }
}
