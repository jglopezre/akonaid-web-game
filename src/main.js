import { Game } from './game.js';

const config = {
    type: Phaser.AUTO,
    width: 350,
    height: 750,
    scene: [Game],
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
}

let game = new Phaser.Game(config);
