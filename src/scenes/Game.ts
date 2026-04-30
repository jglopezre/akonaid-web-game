import Phaser from 'phaser';
import { LiveCounter } from '../components/LiveCounter';
import { PhaseManager } from './PhaseManager';
import { PowerUps } from '../components/PowerUps';

export class Game extends Phaser.Scene {
  private platform!: Phaser.Physics.Arcade.Sprite;
  public ball!: Phaser.Physics.Arcade.Image;
  private readonly startSpeed = -250;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private readonly BALL_INNITIAL_POS_X = 175;
  private readonly BALL_INNITIAL_POS_Y = 678;
  private readonly PLATFORM_INNITIAL_POS_X = 175;
  private readonly PLATFORM_INNITIAL_POS_Y = 700;
  private score = 0;
  private phaseManager!: PhaseManager;
  private liveCounter!: LiveCounter;
  private powerUps!: PowerUps;
  private bgm!: Phaser.Sound.BaseSound;
  private ballHit!: Phaser.Sound.BaseSound;
  private hardBrickHit!: Phaser.Sound.BaseSound;
  private brickHit!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'Game' });
  }

  makePlatform(position: { x: number; y: number }): Phaser.Physics.Arcade.Sprite {
    const platform = this.physics.add.sprite(position.x, position.y, 'playerPlatform');
    (platform.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    (platform.body as Phaser.Physics.Arcade.Body).setImmovable();
    (platform.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    this.anims.create({
      key: 'alive',
      frames: this.anims.generateFrameNumbers('playerPlatform', {
        start: 0,
        end: 7,
      }),
      frameRate: 4,
      repeat: -1,
    });
    return platform;
  }

  makeBall(position: { x: number; y: number }): Phaser.Physics.Arcade.Image {
    const ball = this.physics.add.image(position.x, position.y, 'ball');
    (ball.body as Phaser.Physics.Arcade.Body).setBounce(1);
    (ball.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    ball.setData('glue', true);
    return ball;
  }

  moving(keypress: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (keypress.left.isDown) {
      (this.platform.body as Phaser.Physics.Arcade.Body).setVelocityX(-300);
    } else if (keypress.right.isDown) {
      (this.platform.body as Phaser.Physics.Arcade.Body).setVelocityX(300);
    } else {
      (this.platform.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
  }

  brickImpact(_ball: Phaser.GameObjects.GameObject, brick: Phaser.GameObjects.GameObject): void {
    this.brickHit.play();
    (brick as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
    this.increasePoints(10);
    if (this.phaseManager.bricksGroup.countActive() === 0) {
      this.phaseManager.nextLevel();
      this.setInitialPlatformState();
    }
  }

  hardBrickImpact(): void {
    this.hardBrickHit.play();
  }

  platformImpact(ball: Phaser.GameObjects.GameObject, platform: Phaser.GameObjects.GameObject): void {
    const physBall = ball as Phaser.Physics.Arcade.Image;
    const physPlatform = platform as Phaser.Physics.Arcade.Sprite;
    this.ballHit.play();
    const relativeImpact = physBall.x - physPlatform.x;
    if (relativeImpact > 0) {
      (physBall.body as Phaser.Physics.Arcade.Body).setVelocityX(10 * relativeImpact);
    } else if (relativeImpact < 0) {
      (physBall.body as Phaser.Physics.Arcade.Body).setVelocityX(10 * relativeImpact);
    } else {
      (physBall.body as Phaser.Physics.Arcade.Body).setVelocityX(Phaser.Math.Between(-10, 10));
    }
  }

  increasePoints(points: number): void {
    this.score += points;
    this.scoreText.setText('SCORE: ' + this.score);
  }

  endGame(completed = false): void {
    this.bgm.stop();
    if (!completed) {
      this.scene.start('GameOver');
    } else {
      this.scene.start('Congratulations');
    }
  }

  colliders(): void {
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.physics.add.collider(
      this.ball,
      this.platform,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.platformImpact as any,
      undefined,
      this
    );
  }

  setInitialPlatformState(): void {
    this.platform.x = this.PLATFORM_INNITIAL_POS_X;
    this.platform.y = this.PLATFORM_INNITIAL_POS_Y;
    (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.ball.x = this.BALL_INNITIAL_POS_X;
    this.ball.y = this.BALL_INNITIAL_POS_Y;
    this.ball.setData('glue', true);
  }

  init(): void {
    this.score = 0;
    this.phaseManager = new PhaseManager(this);
    this.liveCounter = new LiveCounter(this, 3);
    this.powerUps = new PowerUps(this);
  }

  preload(): void {
    this.load.audio('ball-hit', 'assets/sfx/ball-hit.ogg');
    this.load.image('ball', 'assets/images/white-ball.png');
    this.load.spritesheet('playerPlatform', 'assets/images/platform-blue-1.png', {
      frameWidth: 88,
      frameHeight: 22,
    });

    this.phaseManager.preload();
    this.powerUps.preload();
    this.liveCounter.preload();
  }

  create(): void {
    this.bgm = this.sound.add('bgm-level1').setVolume(0.2);
    this.ballHit = this.sound.add('ball-hit');
    this.hardBrickHit = this.sound.add('hard-block-hit');
    this.brickHit = this.sound.add('block-hit');
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '20px',
      color: '#fff',
      fontFamily: 'verdana, arial, sans-serif',
    } as Phaser.Types.GameObjects.Text.TextStyle);

    this.platform = this.makePlatform({
      x: this.PLATFORM_INNITIAL_POS_X,
      y: this.PLATFORM_INNITIAL_POS_Y,
    });

    this.ball = this.makeBall({
      x: this.BALL_INNITIAL_POS_X,
      y: this.BALL_INNITIAL_POS_Y,
    });

    this.phaseManager.create();

    this.liveCounter.create();

    const createdCursors = this.input.keyboard.createCursorKeys();
    this.cursors = createdCursors!;

    this.colliders();

    this.platform.anims.play('alive', true);
  }

  update(): void {
    this.moving(this.cursors);

    if (this.ball.y > 755) {
      this.bgm.stop();
      if (this.liveCounter.liveLost()) {
        this.setInitialPlatformState();
      }
    }

    if (this.ball.getData('glue')) {
      this.ball.x = this.platform.x;
      if (this.cursors.up.isDown) {
        this.bgm.play('', { loop: true });
        if (this.ball.getData('glue')) {
          (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(10 * Phaser.Math.Between(-30, 30), this.startSpeed);
          this.ball.setData('glue', false);
        }
      }
    }
  }
}