import { PlayButton } from '../components/play-button.js';

export class GameOver extends Phaser.Scene {
    constructor() {
	super({ key: 'gameover' });
	this.playButton = new PlayButton(this);
    }

    preload() {
	this.playButton.preload();
	this.load.image('gameover-background', 'assets/images/gameover-background.png');
    }

    create() {
	this.add.image(0, 0, 'gameover-background').setOrigin(0, 0);
	this.gameOverText = this.add.text(60, 300, 'GAME OVER', {
            fontSize: '40px',
            fill: '#fff',
	    fontFamily: 'verdana'
        });

	this.playButton.create();
    }
}
