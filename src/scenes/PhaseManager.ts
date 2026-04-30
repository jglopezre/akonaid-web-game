import Phaser from 'phaser';
import { Phase01 } from './Phase01';
import { Phase02 } from './Phase02';
import { PhaseBase } from './PhaseBase';
import { Game } from './Game';

export class PhaseManager {
  private relatedScene: Phaser.Scene;
  private phases: (new (scene: Phaser.Scene) => PhaseBase)[];
  private currentPhase!: PhaseBase;
  public bricksGroup!: Phaser.Physics.Arcade.StaticGroup;
  public hardBricks: Phaser.Physics.Arcade.Sprite[] = [];
  public hardBrickShine: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.relatedScene = scene;
    this.phases = [Phase02, Phase01];
  }

  preload(): void {
    this.relatedScene.load.image('background01', 'assets/images/background01.png');
    this.relatedScene.load.image('background02', 'assets/images/background02.png');

    this.relatedScene.load.image('greenBrick', 'assets/images/green.png');
    this.relatedScene.load.image('orangeBrick', 'assets/images/orange.png');
    this.relatedScene.load.image('whiteBrick', 'assets/images/white.png');
    this.relatedScene.load.image('cyanBrick', 'assets/images/cyan.png');

    this.relatedScene.load.spritesheet('goldBrick', 'assets/images/gold-brick.png', {
      frameWidth: 44,
      frameHeight: 22,
    });
    this.relatedScene.load.audio('bgm-level1', 'assets/bgm/bgm1.ogg');
    this.relatedScene.load.audio('block-hit', 'assets/sfx/block-hit.ogg');
    this.relatedScene.load.audio('hard-block-hit', 'assets/sfx/steel-hit.ogg');
  }

  create(): PhaseBase {
    const CurrentPhaseClass = this.phases.pop()!;
    this.currentPhase = new CurrentPhaseClass(this.relatedScene);
    this.currentPhase.create();
    this.bricksGroup = this.currentPhase.bricksGroup;
    this.hardBricks = this.currentPhase.hardBricks;
    this.hardBrickShine = this.currentPhase.hardBrickShine;
    return this.currentPhase;
  }

  nextLevel(): void {
    if (this.hardBricks.length > 0) {
      this.currentPhase.deleteHardBricks();
    }

    if (this.phases.length === 0) {
      (this.relatedScene as Game).endGame(true);
    } else {
      this.create();
    }
  }

  isPhaseFinished(): boolean {
    return this.currentPhase.isPhaseFinished();
  }
}