import { Game } from './game.js';

const config = {
    type: Phaser.CANVAS,
    width: 350,
    height:600,
    scene: [Game],
    parent: 'game',
    physics: {
	default: 'arcade',
	arcade: {
	    gravity: { y: 400 },
	    debug: false
	}
    }
}

let game = new Phaser.Game(config);
