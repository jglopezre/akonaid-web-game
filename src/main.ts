import Phaser from 'phaser';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Congratulations } from './scenes/Congratulations';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 350,
  height: 750,
  scene: [Game, GameOver, Congratulations],
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};

new Phaser.Game(config);