import { Container, Sprite, Texture, Rectangle, AnimatedSprite } from "pixi.js";
import { World, ComponentType } from "../ecs";

const CELL_W = 46;
const CELL_H = 24;

function createBrick(
  world: World,
  container: Container,
  texture: Texture,
  x: number,
  y: number,
  type: "normal" | "hard",
  points: number,
): number {
  if (type === "hard") {
    const frames: Texture[] = [];
    for (let i = 0; i < 10; i++) {
      frames.push(
        new Texture({
          source: texture.source,
          frame: new Rectangle(0, i * 22, 44, 22),
        }),
      );
    }
    const anim = new AnimatedSprite(frames);
    anim.anchor.set(0.5);
    anim.animationSpeed = 10 / 60;
    anim.play();
    container.addChild(anim);

    return world
      .createEntity()
      .with(ComponentType.Transform, {
        x,
        y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      })
      .with(ComponentType.Sprite, { sprite: anim })
      .with(ComponentType.Collider, {
        width: 44,
        height: 22,
        isStatic: true,
        group: 3,
        enabled: true,
      })
      .with(ComponentType.Brick, { type: "hard", points: 0 })
      .build();
  }

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  container.addChild(sprite);

  return world
    .createEntity()
    .with(ComponentType.Transform, {
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    })
    .with(ComponentType.Sprite, { sprite })
    .with(ComponentType.Collider, {
      width: 44,
      height: 22,
      isStatic: true,
      group: 3,
      enabled: true,
    })
    .with(ComponentType.Brick, { type: "normal", points })
    .build();
}

export function loadPhase02(
  world: World,
  container: Container,
  textures: Record<string, Texture>,
): void {
  // First group: 3 rows x 7 cols, orange, starting y=199
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 37 + col * CELL_W;
      const y = 199 + row * CELL_H;
      createBrick(world, container, textures.orange, x, y, "normal", 10);
    }
  }

  // Second group: y = 287 + 24 = 311
  const y2 = 287 + CELL_H;
  for (let j = 0; j < 5; j++) {
    createBrick(
      world,
      container,
      textures.white,
      37 + j * CELL_W,
      y2,
      "normal",
      10,
    );
  }
  for (let j = 0; j < 3; j++) {
    createBrick(
      world,
      container,
      textures.gold,
      129 + j * CELL_W,
      y2,
      "hard",
      0,
    );
  }
  for (let j = 0; j < 2; j++) {
    createBrick(
      world,
      container,
      textures.white,
      267 + j * CELL_W,
      y2,
      "normal",
      10,
    );
  }

  // Third group: y = 335 + 24 = 359, cyan
  const y3 = 335 + CELL_H;
  for (let j = 0; j < 7; j++) {
    createBrick(
      world,
      container,
      textures.cyan,
      37 + j * CELL_W,
      y3,
      "normal",
      10,
    );
  }

  // Fourth group: y = 359 + 24 = 383
  const y4 = 359 + CELL_H;
  for (let j = 0; j < 2; j++) {
    createBrick(
      world,
      container,
      textures.gold,
      37 + j * CELL_W,
      y4,
      "hard",
      0,
    );
  }
  for (let j = 0; j < 3; j++) {
    createBrick(
      world,
      container,
      textures.green,
      129 + j * CELL_W,
      y4,
      "normal",
      10,
    );
  }
  for (let j = 0; j < 2; j++) {
    createBrick(
      world,
      container,
      textures.gold,
      267 + j * CELL_W,
      y4,
      "hard",
      0,
    );
  }

  // Fifth group: y = 383 + 24 = 407, cyan
  const y5 = 383 + CELL_H;
  for (let j = 0; j < 7; j++) {
    createBrick(
      world,
      container,
      textures.cyan,
      37 + j * CELL_W,
      y5,
      "normal",
      10,
    );
  }

  // Sixth group: y = 407 + 24 = 431, white
  const y6 = 407 + CELL_H;
  for (let j = 0; j < 7; j++) {
    createBrick(
      world,
      container,
      textures.white,
      37 + j * CELL_W,
      y6,
      "normal",
      10,
    );
  }
}
