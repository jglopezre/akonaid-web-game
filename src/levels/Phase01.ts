import { Container, Sprite, Texture, Rectangle, AnimatedSprite } from "pixi.js";
import { World, ComponentType } from "../ecs";

const COLS = 7;
const ROWS = 4;
const CELL_W = 46;
const ORIGIN_X = 37;

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
          frame: new Rectangle(i * 44, 0, 44, 22),
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

export function loadPhase01(
  world: World,
  container: Container,
  textures: Record<string, Texture>,
): void {
  const rows = [
    { y: 250, texture: textures.white },
    { y: 274, texture: textures.orange },
    { y: 298, texture: textures.cyan },
    { y: 322, texture: textures.green },
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = ORIGIN_X + col * CELL_W;
      const y = rows[row].y;
      createBrick(world, container, rows[row].texture, x, y, "normal", 10);
    }
  }
}
