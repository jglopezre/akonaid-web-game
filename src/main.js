import { Game } from './scenes/game.js';
import { GameOver } from './scenes/gameover.js';
import { Congratulations } from './scenes/congratulations.js';


const config = {
    type: Phaser.AUTO,
    width: 350,
    height: 750,
    scene: [Game, GameOver, Congratulations],
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
}

let game = new Phaser.Game(config);
