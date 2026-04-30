import Phaser from 'phaser';
import { PlayButton } from '../components/PlayButton';

export class Congratulations extends Phaser.Scene {
  private playButton!: PlayButton;

  constructor() {
    super({ key: 'Congratulations' });
  }

  preload(): void {
    this.playButton.preload();
  }

  create(): void {
    this.add.text(20, 300, 'ACOMPLISHED!!', {
      fontSize: '40px',
      color: '#fff',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.playButton.create();
  }
}