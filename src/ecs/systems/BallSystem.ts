import { ComponentType } from "../types";
import type { World } from "../World";
import type { ISystem } from "./ISystem";
import type {
  TransformData,
  VelocityData,
  SpriteData,
  BrickData,
  ColliderData,
} from "../types";
import type { AudioManager } from "../../audio/AudioManager";
import {
  aabbIntersects,
  resolveOverlap,
  centerAABB,
} from "../../physics/AABBUtils";

export interface BallSystemCallbacks {
  onBrickDestroyed(points: number): void;
}

export class BallSystem implements ISystem {
  readonly requiredMask =
    ComponentType.Transform | ComponentType.Velocity | ComponentType.Ball;

  private world: World | null = null;
  private readonly audioManager: AudioManager;
  private readonly callbacks: BallSystemCallbacks;

  constructor(audioManager: AudioManager, callbacks: BallSystemCallbacks) {
    this.audioManager = audioManager;
    this.callbacks = callbacks;
  }

  init(world: World): void {
    this.world = world;
  }

  update(_deltaTime: number): void {
    if (!this.world) return;

    const balls = this.world.queryEntities(this.requiredMask);
    if (balls.length === 0) return;
    const ballEntity = balls[0];

    const ballTransform = this.world.getComponent<TransformData>(
      ballEntity,
      ComponentType.Transform,
    )!;
    const ballVelocity = this.world.getComponent<VelocityData>(
      ballEntity,
      ComponentType.Velocity,
    )!;
    const ballSprite = this.world.getComponent<SpriteData>(
      ballEntity,
      ComponentType.Sprite,
    )!;
    const ballW = ballSprite.sprite.width;
    const ballH = ballSprite.sprite.height;

    // --- Wall collisions ---
    let ballAabb = centerAABB(ballTransform.x, ballTransform.y, ballW, ballH);

    if (ballAabb.x < 0) {
      ballVelocity.vx = Math.abs(ballVelocity.vx);
      ballTransform.x = ballW / 2;
    } else if (ballAabb.x + ballW > 350) {
      ballVelocity.vx = -Math.abs(ballVelocity.vx);
      ballTransform.x = 350 - ballW / 2;
    }

    if (ballAabb.y < 0) {
      ballVelocity.vy = Math.abs(ballVelocity.vy);
      ballTransform.y = ballH / 2;
    }

    // --- Paddle collision ---
    ballAabb = centerAABB(ballTransform.x, ballTransform.y, ballW, ballH);

    const paddles = this.world.queryEntities(
      ComponentType.Transform |
        ComponentType.Collider |
        ComponentType.InputControlled,
    );

    if (paddles.length > 0) {
      const paddle = paddles[0];
      const paddleTransform = this.world.getComponent<TransformData>(
        paddle,
        ComponentType.Transform,
      )!;
      const paddleCollider = this.world.getComponent<ColliderData>(
        paddle,
        ComponentType.Collider,
      )!;
      const paddleAabb = centerAABB(
        paddleTransform.x,
        paddleTransform.y,
        paddleCollider.width,
        paddleCollider.height,
      );

      if (aabbIntersects(ballAabb, paddleAabb)) {
        const relativeImpact = ballTransform.x - paddleTransform.x;
        ballVelocity.vx = 10 * relativeImpact;
        ballVelocity.vy = -Math.abs(ballVelocity.vy);
        ballTransform.y = paddleAabb.y - ballH / 2;
        this.audioManager.play("ball-hit");
      }
    }

    // --- Brick collisions ---
    ballAabb = centerAABB(ballTransform.x, ballTransform.y, ballW, ballH);

    const bricks = this.world.queryEntities(
      ComponentType.Brick | ComponentType.Transform | ComponentType.Collider,
    );

    for (const brickId of bricks) {
      const brickTransform = this.world.getComponent<TransformData>(
        brickId,
        ComponentType.Transform,
      )!;
      const brickCollider = this.world.getComponent<ColliderData>(
        brickId,
        ComponentType.Collider,
      )!;
      const brickData = this.world.getComponent<BrickData>(
        brickId,
        ComponentType.Brick,
      )!;

      const brickAabb = centerAABB(
        brickTransform.x,
        brickTransform.y,
        brickCollider.width,
        brickCollider.height,
      );

      const overlap = resolveOverlap(ballAabb, brickAabb);
      if (!overlap) continue;

      if (overlap.axis === "x") {
        ballVelocity.vx *= -1;
        ballTransform.x += overlap.x;
      } else {
        ballVelocity.vy *= -1;
        ballTransform.y += overlap.y;
      }

      if (brickData.type === "hard") {
        this.audioManager.play("steel-hit");
      } else {
        this.audioManager.play("block-hit");
        this.callbacks.onBrickDestroyed(brickData.points);

        const brickSprite = this.world.getComponent<SpriteData>(
          brickId,
          ComponentType.Sprite,
        );
        if (brickSprite?.sprite.parent) {
          brickSprite.sprite.parent.removeChild(brickSprite.sprite);
        }
        this.world.destroyEntity(brickId);
      }

      break;
    }
  }

  destroy(): void {
    this.world = null;
  }
}
