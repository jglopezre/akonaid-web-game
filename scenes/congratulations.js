import { PlayButton } from '../components/play-button.js';

export class Congratulations extends Phaser.Scene {
    constructor() {
	super({ key: 'congratulations' });
	this.playButton = new PlayButton(this);
    }

    preload() {
	this.PlayButton.preload();
    }

    create() {
	this.congratsTetx = this.add.text(20, 300, 'ACOMPLISHED!!', {
            fontSize: '40px',
            fill: '#fff',
        });
	this.PlayButton.create();
    }
}
