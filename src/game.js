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
	gameRectangle.body.setImmovable();
	return gameRectangle;
    }

    velocity() {
	let speed = 100 * Phaser.Math.Between(1.3, 2);
	if(Phaser.Math.Between(0, 10) > 5) {
	    speed = 0 - speed;
	}
	return speed
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
	ball.body.setBounce(1);
	ball.body.setCollideWorldBounds(true);
	ball.body.setVelocity(this.velocity(), 10)
	return ball;
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

    colliders() {
	this.physics.world.setBoundsCollision(true, true, true, true);
	this.physics.add.collider(this.balls[0], this.platform[0]);
	
    }

    

    
    preload(){
	this.load.image('background', 'assets/background01.png');
    }
    
    create(){
	this.add.image(0, 0, 'background').setOrigin(0, 0);
	this.platform[0] = this.makeRectangle({
	    x: 175,
	    y:570,
	    width: 80,
	    color: 0xfaea50
	});
	
	this.balls[0] = this.makeBall({x: 175, y: 100});
	this.colliders();

	this.cursors = this.input.keyboard.createCursorKeys();

	
    }

    update() {
	this.moving(this.cursors, 0);
    }
}
