import Phaser from 'phaser';

export class PowerUps {
  private relatedScene: Phaser.Scene;
  private powerUps!: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.relatedScene = scene;
    this.powerUps = this.relatedScene.physics.add.group();
  }

  preload(): void {
    this.relatedScene.load.spritesheet('powerup-capsules', 'assets/images/power-ups.png', {
      frameWidth: 44,
      frameHeight: 22,
    });
  }

  create(): void {
    const white = this.powerUps.create(37, 400, 'powerup-capsules');
    const orange = this.powerUps.create(83, 400, 'powerup-capsules');
    const green = this.powerUps.create(129, 400, 'powerup-capsules');
    const cyan = this.powerUps.create(175, 400, 'powerup-capsules');

    const animationNames = ['white-caps', 'orange-caps', 'green-caps', 'cyan-caps'];
    const frameSelectors = [
      [0, 7],
      [8, 15],
      [16, 23],
      [24, 31],
    ];

    for (let i = 0; i < 4; i++) {
      this.relatedScene.anims.create({
        key: animationNames[i],
        frames: this.relatedScene.anims.generateFrameNumbers('powerup-capsules', {
          start: frameSelectors[i][0],
          end: frameSelectors[i][1],
        }),
        frameRate: 16,
        repeat: -1,
      });
    }

    white.anims.play('white-caps', true);
    orange.anims.play('orange-caps', true);
    green.anims.play('green-caps', true);
    cyan.anims.play('cyan-caps', true);
  }
}