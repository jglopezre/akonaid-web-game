export class Game extends Phaser.Scene {
		constructor() {
				super({ key: 'game'});
				this.platform = [];
				this.balls = [];
				this.cursors;
		}

		
		
		//Platform creating function
		makeRectangle(description) {
				const height = 10;
				let gameRectangle = this.physics.add.existing(
						this.add.rectangle(
								description.x,
								description.y,
								description.width,
								height,
								description.color));
				gameRectangle.body.allowGravity = false;
				return gameRectangle;
		}

		makeBall(description) {
				const width = 8;
				const height = 8;
				const color = 0xccccff;
				let ball = this.physics.add.existing(
						this.add.rectangle(
								description.x,
								description.y,
								width,
								height,
								color
						)
				);

		}

		moving (keypress) {
				if(keypress.left.isDown){
						this.platform[0].body.setVelocityX(-300);
				}
				else if (keypress.right.isDown) {
						this.platform[0].body.setVelocityX(300);
				}
				else {
						this.platform[0].body.setVelocityX(0);
				}
		}

		
		preload(){
				this.load.image('background', 'assets/background01.png');
		}
		
		create(){
				this.add.image(185, 350, 'background');
				this.platform[0] = this.makeRectangle({
						x: 185,
						y:650,
						width: 80,
						color: 0x00aaee
				});
				
				this.mainBall = this.makeBall({x: 185, y: 670});

				this.cursors = this.input.keyboard.createCursorKeys(); 
		}

		update() {
				this.moving(this.cursors, 0);
		}
}
