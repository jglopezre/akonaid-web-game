import Phaser from 'phaser';

export class PlayButton {
  private relatedScene: Phaser.Scene;
  private playButton!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.relatedScene = scene;
  }

  preload(): void {
    this.relatedScene.load.spritesheet('button', 'assets/images/play-button.png', {
      frameWidth: 132,
      frameHeight: 44,
    });
  }

  create(): void {
    this.playButton = this.relatedScene.add.sprite(175, 500, 'button').setInteractive();

    this.playButton.on('pointerover', () => {
      this.playButton.setFrame(0);
    });

    this.playButton.on('pointerout', () => {
      this.playButton.setFrame(1);
    });

    this.playButton.on('pointerdown', () => {
      this.relatedScene.scene.start('game');
    });
  }
}