import Phaser from 'phaser';
import { Game } from './Game';

export abstract class PhaseBase {
  protected relatedScene: Phaser.Scene;
  public bricksGroup!: Phaser.Physics.Arcade.StaticGroup;
  public hardBricks: Phaser.Physics.Arcade.Sprite[] = [];
  public hardBrickShine: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.relatedScene = scene;
  }

  configureCollision(): void {
    const game = this.relatedScene as Game;
    this.relatedScene.physics.add.collider(
      game.ball,
      this.bricksGroup,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      game.brickImpact as any,
      undefined,
      this.relatedScene
    );
  }

  configureHardCollision(): void {
    const game = this.relatedScene as Game;
    this.relatedScene.physics.add.collider(
      game.ball,
      this.hardBricks,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      game.hardBrickImpact as any,
      undefined,
      this.relatedScene
    );
  }

  createHardBrickAnimation(): void {
    this.relatedScene.anims.create({
      key: 'goldShine',
      frames: this.relatedScene.anims.generateFrameNumbers('goldBrick', {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
      repeatDelay: 2000,
    });

    this.hardBricks.forEach(item => item.anims.play('goldShine', true));
  }

  deleteHardBricks(): void {
    if (this.hardBricks) {
      this.hardBricks.forEach(item => {
        item.disableBody(true, true);
      });
    }
  }

  abstract create(): void;
  abstract isPhaseFinished(): boolean;
}