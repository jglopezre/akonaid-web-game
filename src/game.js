export class Game extends Phaser.Scene {
    constructor() {
	super({ key: 'game'});
	this.platform = [];
	this.balls = [];
	this.startSpeed = -250;
	this.cursors;
	this.scoreText;
    }

    makeBricks() {
	this.bricks = this.physics.add.staticGroup({
	    key: ['whiteBrick', 'orangeBrick', 'cyanBrick', 'greenBrick'],
	    frameQuantity: 7,
	    gridAlign: {
		width: 7,
		height: 4,
		cellWidth: 46,
		cellHeight: 24,
		x: 37,
		y: 150
	    }
	})
	
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
	gameRectangle.body.setCollideWorldBounds(true);
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
	ball.body.setBounce(1);
	ball.body.setCollideWorldBounds(true);
	ball.setData('glue', true);
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

    platformImpact(ball, platform) {
	this.score ++;
	this.scoreText.setText('SCORE: ' + this.score);
	let relativeImpact = ball.x - platform.x;
	if(relativeImpact > 0) {
	    ball.body.setVelocityX(10 * relativeImpact);
	} else if(relativeImpact < 0) {
	    ball.body.setVelocityX(10 * relativeImpact);
	} else {
	    ball.body.setVelocityX(Phaser.Math.Between(-10, 10));
	}

	
    }

    brickImpact(ball, bricks) {
	bricks.disableBody(true, true);
    }

    colliders() {
	this.physics.world.setBoundsCollision(true, true, true, false);
	this.physics.add.collider(this.balls[0], this.platform[0], this.platformImpact, null, this);
	this.physics.add.collider(this.balls[0], this.bricks, this.brickImpact, null, this);
	
    }

    /*********SCENE DEFAULT METHODS*************************************************/
    
    init() {
	this.score = 0;
    }
    
    preload(){
	this.load.image('background', 'assets/background01.png');
	this.load.image('greenBrick', 'assets/green.png');
	this.load.image('orangeBrick', 'assets/orange.png');
	this.load.image('whiteBrick', 'assets/white.png');
	this.load.image('cyanBrick', 'assets/cyan.png')
	
    }
    
    create(){
	this.add.image(0, 0, 'background').setOrigin(0, 0);

	this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
	    fontSize: '20px',
	    fill: '#fff',
	    fontFamily: 'verdana, arial, sans-serif'
	});
	
	this.platform[0] = this.makeRectangle({
	    x: 175,
	    y:570,
	    width: 80,
	    color: 0xfaea50
	});
	
	this.balls[0] = this.makeBall({x: 175, y: 561});
	
	this.cursors = this.input.keyboard.createCursorKeys();

	this.makeBricks();
	
	this.colliders();
	
    }

    update() {
	this.moving(this.cursors, 0);

	if(this.balls[0].y > 604) {
	    console.log('GAME OVER');
	    this.scene.pause();
	}

	if(this.balls[0].getData('glue')) {
	    this.balls[0].x = this.platform[0].x;
	    if(this.cursors.up.isDown) {
		if(this.balls[0].getData('glue')) {
		    this.balls[0].body.setVelocity((10 * Phaser.Math.Between(-30 , 30)), this.startSpeed);
		    this.balls[0].setData('glue', false);
		}
	    }
	}
    }
    /****************************************************************************************/
    /****************************************************************************************/
}
