import {
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  Texture,
  Ticker,
  AnimatedSprite,
} from "pixi.js";
import type { InputManager } from "../input/InputManager";
import { InputAction } from "../input/InputAction";
import type { IScene, ISceneContext } from "./IScene";
import type { SceneManager } from "./SceneManager";
import {
  World,
  ComponentType,
  InputSystem,
  MovementSystem,
  RenderSystem,
  BallSystem,
} from "../ecs";
import type {
  TransformData,
  VelocityData,
  SpriteData,
  BrickData,
} from "../ecs/types";
import { loadPhase01 } from "../levels/Phase01";
import { loadPhase02 } from "../levels/Phase02";

const WORLD_WIDTH = 350;
const WORLD_HEIGHT = 750;

export class ArkanoidScene implements IScene {
  readonly name = "arkanoid";
  readonly container: Container;

  private readonly inputManager: InputManager;
  private readonly sceneManager: SceneManager;
  private world: World | null = null;
  private context: ISceneContext | null = null;

  private ballEntity = 0;
  private paddleEntity = 0;
  private bgSprite: Sprite | null = null;
  private scoreText: Text | null = null;
  private livesSprites: Sprite[] = [];

  private glue = true;
  private lives = 3;
  private score = 0;
  private currentPhaseIndex = 0;
  private normalBricksCount = 0;

  constructor(
    _parent: Container,
    inputManager: InputManager,
    sceneManager: SceneManager,
  ) {
    this.inputManager = inputManager;
    this.sceneManager = sceneManager;
    this.container = new Container();
    this.container.label = "arkanoid-scene";
  }

  async init(context: ISceneContext): Promise<void> {
    this.context = context;

    this.world = new World();
    this.world.addSystem(new InputSystem(this.inputManager, 300));
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(
      new BallSystem(context.audioManager, {
        onBrickDestroyed: (points) => this.updateScore(points),
      }),
    );
    this.world.addSystem(new RenderSystem());
  }

  async create(): Promise<void> {
    const [
      ballTexture,
      platformTexture,
      bg1Texture,
      whiteTexture,
      orangeTexture,
      cyanTexture,
      greenTexture,
      goldTexture,
      livesTexture,
    ] = await Promise.all([
      Assets.load("/assets/images/white-ball.png"),
      Assets.load("/assets/images/platform-blue-1.png"),
      Assets.load("/assets/images/background01.png"),
      Assets.load("/assets/images/white.png"),
      Assets.load("/assets/images/orange.png"),
      Assets.load("/assets/images/cyan.png"),
      Assets.load("/assets/images/green.png"),
      Assets.load("/assets/images/gold-brick.png"),
      Assets.load("/assets/images/lives.png"),
    ]);

    // Background
    this.bgSprite = new Sprite(bg1Texture);
    this.container.addChild(this.bgSprite);

    // Walls
    this.createWalls();

    // Paddle (AnimatedSprite) — spritesheet vertical: 88x176, 8 frames de 88x22
    const platformFrames: Texture[] = [];
    for (let i = 0; i < 8; i++) {
      platformFrames.push(
        new Texture({
          source: platformTexture.source,
          frame: new Rectangle(0, i * 22, 88, 22),
        }),
      );
    }
    const paddleAnim = new AnimatedSprite(platformFrames);
    paddleAnim.anchor.set(0.5);
    paddleAnim.animationSpeed = 4 / 60;
    paddleAnim.play();
    this.container.addChild(paddleAnim);

    this.paddleEntity = this.world!.createEntity()
      .with(ComponentType.Transform, {
        x: 175,
        y: 700,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      .with(ComponentType.Velocity, {
        vx: 0,
        vy: 0,
        angularVelocity: 0,
      })
      .with(ComponentType.Sprite, { sprite: paddleAnim })
      .with(ComponentType.InputControlled, {})
      .with(ComponentType.Collider, {
        width: 88,
        height: 22,
        isStatic: false,
        group: 1,
        enabled: true,
      })
      .build();

    // Ball
    const ballSprite = new Sprite(ballTexture);
    ballSprite.anchor.set(0.5);
    this.container.addChild(ballSprite);

    this.ballEntity = this.world!.createEntity()
      .with(ComponentType.Transform, {
        x: 175,
        y: 678,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      .with(ComponentType.Velocity, {
        vx: 0,
        vy: 0,
        angularVelocity: 0,
      })
      .with(ComponentType.Sprite, { sprite: ballSprite })
      .with(ComponentType.Ball, {})
      .build();

    // Bricks
    const brickTextures = {
      white: whiteTexture,
      orange: orangeTexture,
      cyan: cyanTexture,
      green: greenTexture,
      gold: goldTexture,
    };
    this.loadPhase(this.currentPhaseIndex, brickTextures);

    // HUD
    this.createHUD(livesTexture);

    // BGM
    this.context!.audioManager.play("bgm", { loop: true, volume: 0.2 });
  }

  update(ticker: Ticker): void {
    if (!this.world) return;

    this.world.update(ticker.deltaTime);

    // Clamp paddle to world bounds
    const paddleTransform = this.world.getComponent<TransformData>(
      this.paddleEntity,
      ComponentType.Transform,
    )!;
    paddleTransform.x = Math.max(
      44,
      Math.min(WORLD_WIDTH - 44, paddleTransform.x),
    );

    const paddleVelocity = this.world.getComponent<VelocityData>(
      this.paddleEntity,
      ComponentType.Velocity,
    )!;
    paddleVelocity.vy = 0;

    // Glue behaviour
    if (this.glue) {
      const ballTransform = this.world.getComponent<TransformData>(
        this.ballEntity,
        ComponentType.Transform,
      )!;
      ballTransform.x = paddleTransform.x;

      if (
        this.inputManager.isPressed(InputAction.Up) ||
        this.inputManager.isPressed(InputAction.Action1)
      ) {
        this.glue = false;
        const ballVelocity = this.world.getComponent<VelocityData>(
          this.ballEntity,
          ComponentType.Velocity,
        )!;
        ballVelocity.vx = Math.random() * 600 - 300;
        ballVelocity.vy = -250;
      }
    } else {
      const ballTransform = this.world.getComponent<TransformData>(
        this.ballEntity,
        ComponentType.Transform,
      )!;
      if (ballTransform.y > 755) {
        this.loseLife();
      }
    }

    // Phase completion
    if (this.normalBricksCount <= 0) {
      this.nextPhase();
    }
  }

  pause(): void {
    this.container.visible = false;
  }

  resume(): void {
    this.container.visible = true;
  }

  destroy(): void {
    this.context?.audioManager.stop("bgm");
    this.world?.destroy();
    this.world = null;
    this.container.destroy({ children: true });
  }

  private loseLife(): void {
    this.lives--;
    this.context!.audioManager.play("death");

    const life = this.livesSprites.pop();
    if (life) {
      life.parent?.removeChild(life);
      life.destroy();
    }

    if (this.lives <= 0) {
      this.sceneManager.start("gameover");
      return;
    }

    this.glue = true;
    const ballTransform = this.world!.getComponent<TransformData>(
      this.ballEntity,
      ComponentType.Transform,
    )!;
    const ballVelocity = this.world!.getComponent<VelocityData>(
      this.ballEntity,
      ComponentType.Velocity,
    )!;
    ballTransform.x = 175;
    ballTransform.y = 678;
    ballVelocity.vx = 0;
    ballVelocity.vy = 0;

    const paddleTransform = this.world!.getComponent<TransformData>(
      this.paddleEntity,
      ComponentType.Transform,
    )!;
    paddleTransform.x = 175;
    paddleTransform.y = 700;
  }

  private nextPhase(): void {
    this.currentPhaseIndex++;
    if (this.currentPhaseIndex >= 2) {
      this.sceneManager.start("congratulations");
      return;
    }

    this.clearBricks();

    // Switch background texture
    if (this.bgSprite) {
      const nextKey =
        this.currentPhaseIndex === 1
          ? "/assets/images/background02.png"
          : "/assets/images/background01.png";
      Assets.load(nextKey).then((texture: Texture) => {
        this.bgSprite!.texture = texture;
      });
    }

    const brickTextures = {
      white: null as unknown as Texture,
      orange: null as unknown as Texture,
      cyan: null as unknown as Texture,
      green: null as unknown as Texture,
      gold: null as unknown as Texture,
    };

    // Re-load textures for the new phase (they are cached by Assets)
    Promise.all([
      Assets.load("/assets/images/white.png"),
      Assets.load("/assets/images/orange.png"),
      Assets.load("/assets/images/cyan.png"),
      Assets.load("/assets/images/green.png"),
      Assets.load("/assets/images/gold-brick.png"),
    ]).then(([white, orange, cyan, green, gold]) => {
      brickTextures.white = white;
      brickTextures.orange = orange;
      brickTextures.cyan = cyan;
      brickTextures.green = green;
      brickTextures.gold = gold;
      this.loadPhase(this.currentPhaseIndex, brickTextures);
    });

    // Reset ball
    this.glue = true;
    const ballTransform = this.world!.getComponent<TransformData>(
      this.ballEntity,
      ComponentType.Transform,
    )!;
    const ballVelocity = this.world!.getComponent<VelocityData>(
      this.ballEntity,
      ComponentType.Velocity,
    )!;
    ballTransform.x = 175;
    ballTransform.y = 678;
    ballVelocity.vx = 0;
    ballVelocity.vy = 0;

    const paddleTransform = this.world!.getComponent<TransformData>(
      this.paddleEntity,
      ComponentType.Transform,
    )!;
    paddleTransform.x = 175;
    paddleTransform.y = 700;
  }

  private loadPhase(index: number, textures: Record<string, Texture>): void {
    if (index === 0) {
      loadPhase01(this.world!, this.container, textures);
    } else {
      loadPhase02(this.world!, this.container, textures);
    }

    const bricks = this.world!.queryEntities(ComponentType.Brick);
    this.normalBricksCount = 0;
    for (const id of bricks) {
      const brick = this.world!.getComponent<BrickData>(
        id,
        ComponentType.Brick,
      )!;
      if (brick.type === "normal") this.normalBricksCount++;
    }
  }

  private clearBricks(): void {
    const bricks = this.world!.queryEntities(ComponentType.Brick);
    for (const id of bricks) {
      const spriteData = this.world!.getComponent<SpriteData>(
        id,
        ComponentType.Sprite,
      );
      if (spriteData?.sprite.parent) {
        spriteData.sprite.parent.removeChild(spriteData.sprite);
      }
      this.world!.destroyEntity(id);
    }
  }

  private updateScore(points: number): void {
    this.score += points;
    this.normalBricksCount--;
    if (this.scoreText) {
      this.scoreText.text = `SCORE: ${this.score}`;
    }
  }

  private createHUD(livesTexture: Texture): void {
    this.scoreText = new Text({
      text: "SCORE: 0",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0xffffff,
      },
    });
    this.scoreText.position.set(10, 10);
    this.container.addChild(this.scoreText);

    for (let i = 0; i < this.lives; i++) {
      const life = new Sprite(livesTexture);
      life.position.set(310 - i * 20, 10);
      this.container.addChild(life);
      this.livesSprites.push(life);
    }
  }

  private createWalls(): void {
    const thickness = 10;

    // Top
    this.createWall(WORLD_WIDTH / 2, -thickness / 2, WORLD_WIDTH, thickness);
    // Left
    this.createWall(-thickness / 2, WORLD_HEIGHT / 2, thickness, WORLD_HEIGHT);
    // Right
    this.createWall(
      WORLD_WIDTH + thickness / 2,
      WORLD_HEIGHT / 2,
      thickness,
      WORLD_HEIGHT,
    );
    // Bottom is open (ball falls)
  }

  private createWall(x: number, y: number, w: number, h: number): void {
    const g = new Graphics();
    g.rect(0, 0, w, h);
    g.fill({ color: 0x444444 });
    g.pivot.set(w / 2, h / 2);
    g.x = x;
    g.y = y;
    this.container.addChild(g);

    this.world!.createEntity()
      .with(ComponentType.Transform, {
        x,
        y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      .with(ComponentType.Collider, {
        width: w,
        height: h,
        isStatic: true,
        group: 2,
        enabled: true,
      })
      .build();
  }
}
