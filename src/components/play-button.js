export class PlayButton {
	constructor(scene) {
		this.relatedScene = scene;
	}

	preload() {
		this.relatedScene.load.spritesheet('button', 'assets/images/play-button.png', { frameWidth: 132, frameHeight: 44 });
	}

	create() {
		this.playButton = this.relatedScene.add.sprite(175, 500, 'button').setInteractive();

		this.playButton.on('pointerover', () => {
			this.playButton.setFrame(0);
		});

		this.playButton.on('pointerout', () => {
			this.playButton.setFrame(1);
		});

		this.playButton.on('pointerdown', () => {
			this.relatedScene.scene.start('game');
		});
	}
}
