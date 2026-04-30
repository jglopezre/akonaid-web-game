import Phaser from 'phaser';
import { Game } from '../scenes/Game';

export class LiveCounter {
  private relatedScene: Phaser.Scene;
  private initialLives: number;
  private death!: Phaser.Sound.BaseSound;
  private livesSprites!: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene, initialLives: number) {
    this.relatedScene = scene;
    this.initialLives = initialLives;
  }

  preload(): void {
    this.relatedScene.load.image('lives', 'assets/images/lives.png');
    this.relatedScene.load.audio('death', 'assets/sfx/death.ogg');
  }

  create(): void {
    const displacement = 32;
    const firstPosition = 350 - (this.initialLives - 1) * displacement;

    this.death = this.relatedScene.sound.add('death');

    this.livesSprites = this.relatedScene.physics.add.staticGroup({
      key: 'lives',
      frameQuantity: this.initialLives - 1,
      gridAlign: {
        width: this.initialLives - 1,
        height: 1,
        cellWidth: displacement,
        cellHeight: 32,
        x: firstPosition,
        y: 20,
      },
    });
  }

  liveLost(): boolean {
    this.death.play();
    if (this.livesSprites.countActive() === 0) {
      (this.relatedScene as Game).endGame();
      return false;
    }
    this.livesSprites.getFirstAlive()!.disableBody(true, true);
    return true;
  }
}