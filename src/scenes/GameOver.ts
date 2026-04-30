import Phaser from 'phaser';
import { PlayButton } from '../components/PlayButton';

export class GameOver extends Phaser.Scene {
  private playButton!: PlayButton;

  constructor() {
    super({ key: 'GameOver' });
  }

  preload(): void {
    this.playButton.preload();
    this.load.image('gameover-background', 'assets/images/gameover-background.png');
  }

  create(): void {
    this.add.image(0, 0, 'gameover-background').setOrigin(0, 0);
    this.add.text(60, 300, 'GAME OVER', {
      fontSize: '40px',
      color: '#fff',
      fontFamily: 'verdana',
    } as Phaser.Types.GameObjects.Text.TextStyle);

    this.playButton.create();
  }
}