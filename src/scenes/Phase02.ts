import Phaser from 'phaser';
import { PhaseBase } from './PhaseBase';

const WWIDTH = 5;
const CELLWWIDTH = 46;
const CELLHHEIGHT = 24;

export class Phase02 extends PhaseBase {
  private bricks: Phaser.Physics.Arcade.Sprite[] = [];

  create(): void {
    this.relatedScene.add.image(0, 0, 'background02').setOrigin(0, 0).setDepth(-1);

    this.bricksGroup = this.relatedScene.physics.add.staticGroup();
    const hardBricksGroup = this.relatedScene.physics.add.staticGroup();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 7; j++) {
        this.bricks.push(
          this.bricksGroup.create(37 + CELLWWIDTH * j, 199 + CELLHHEIGHT * i, 'orangeBrick') as Phaser.Physics.Arcade.Sprite
        );
      }
    }

    for (let j = 0; j < WWIDTH; j++) {
      this.bricks.push(
        this.bricksGroup.create(37 + CELLWWIDTH * j, 287 + CELLHHEIGHT, 'whiteBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 3; j++) {
      this.hardBricks.push(
        hardBricksGroup.create(129 + CELLWWIDTH * j, 287 + CELLHHEIGHT, 'goldBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 2; j++) {
      this.bricks.push(
        this.bricksGroup.create(267 + CELLWWIDTH * j, 287 + CELLHHEIGHT, 'whiteBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 7; j++) {
      this.bricks.push(
        this.bricksGroup.create(37 + CELLWWIDTH * j, 335 + CELLHHEIGHT, 'cyanBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 2; j++) {
      this.hardBricks.push(
        hardBricksGroup.create(37 + CELLWWIDTH * j, 359 + CELLHHEIGHT, 'goldBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 3; j++) {
      this.bricks.push(
        this.bricksGroup.create(129 + CELLWWIDTH * j, 359 + CELLHHEIGHT, 'greenBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 2; j++) {
      this.hardBricks.push(
        hardBricksGroup.create(267 + CELLWWIDTH * j, 359 + CELLHHEIGHT, 'goldBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 7; j++) {
      this.bricks.push(
        this.bricksGroup.create(37 + CELLWWIDTH * j, 383 + CELLHHEIGHT, 'cyanBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    for (let j = 0; j < 7; j++) {
      this.bricks.push(
        this.bricksGroup.create(37 + CELLWWIDTH * j, 407 + CELLHHEIGHT, 'whiteBrick') as Phaser.Physics.Arcade.Sprite
      );
    }

    this.createHardBrickAnimation();
    this.configureCollision();
    this.configureHardCollision();
  }

  isPhaseFinished(): boolean {
    return this.bricksGroup.countActive() === 0 && this.hardBricks.length === 0;
  }
}