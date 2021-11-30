import { LiveCounter } from "../components/livecounter.js";

export class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'game'
        });
        this.platform = null;
        this.ball = null;
        this.startSpeed = -250;
        this.cursors = null;
        this.scoreText = null;
        this.BALL_INNITIAL_POS_X = 175;
        this.BALL_INNITIAL_POS_Y = 678;
        this.PLATFORM_INNITIAL_POS_X = 175;
        this.PLATFORM_INNITIAL_POS_Y = 700;
    }

    makeBricks() {
        let bricks = this.physics.add.staticGroup({
            key: ['whiteBrick', 'orangeBrick', 'cyanBrick', 'greenBrick'],
            frameQuantity: 7,
            gridAlign: {
                width: 7,
                height: 4,
                cellWidth: 46,
                cellHeight: 24,
                x: 37,
                y: 250
            }
        });
        return bricks;
    }

    //Platform creating function
    makePlatform(position) {
        let platform = this.physics.add.sprite(position.x, position.y, 'playerPlatform');
        platform.body.allowGravity = false;
        platform.body.setImmovable();
        platform.body.setCollideWorldBounds(true);
        this.anims.create({
            key: 'alive',
            frames: this.anims.generateFrameNumbers('playerPlatform', {
                start: 0,
                end: 7
            }),
            frameRate: 4,
            repeat: -1
        });
        return platform;
    }


    makeBall(position) {
        let ball = this.physics.add.image(position.x, position.y, 'ball');
        ball.body.setBounce(1);
        ball.body.setCollideWorldBounds(true);
        ball.setData('glue', true);
        return ball;
    }

    moving(keypress) {
        if (keypress.left.isDown) {
            this.platform.body.setVelocityX(-300);
        } else if (keypress.right.isDown) {
            this.platform.body.setVelocityX(300);
        } else {
            this.platform.body.setVelocityX(0);
        }
    }

    platformImpact(ball, platform) {
        this.ballHit.play();
        let relativeImpact = ball.x - platform.x;
        if (relativeImpact > 0) {
            ball.body.setVelocityX(10 * relativeImpact);
        } else if (relativeImpact < 0) {
            ball.body.setVelocityX(10 * relativeImpact);
        } else {
            ball.body.setVelocityX(Phaser.Math.Between(-10, 10));
        }
    }

    increasePoints(points) {
        this.score += points;
        this.scoreText.setText('SCORE: ' + this.score);
    }

    endGame(completed = false) {
        this.bgm.stop();
	    if(! completed) {
	        this.scene.start('gameover');
	    } else {
	        this.scene.start('congratulations');
	    }
    }

    brickImpact(ball, bricks) {
        this.brickHit.play();
        bricks.disableBody(true, true);
        this.increasePoints(10);
        if (this.bricks.countActive() === 0) {
	    this.endGame(true);
        }
    }

    colliders() {
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.add.collider(this.ball, this.platform, this.platformImpact, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.brickImpact, null, this);
    }

    setInitialPlatformState() {
        //this.platform.x = this.PLATFORM_INNITIAL_POS_X
        this.platform.y = this.PLATFORM_INNITIAL_POS_Y
        this.ball.body.setVelocity(0, 0);
        //this.ball.x = this.BALL_INNITIAL_POS_X;
        this.ball.y = this.BALL_INNITIAL_POS_Y;
        this.ball.setData('glue', true);
    }

    /*********SCENE DEFAULT METHODS*************************************************/

    init() {
        this.score = 0;
        this.liveCounter = new LiveCounter(this, 3);
    }

    preload() {
        this.load.audio('bgm-level1', 'assets/bgm/bgm1.wav');
        this.load.audio('ball-hit', 'assets/sfx/ball-hit.wav');
        this.load.audio('block-hit', 'assets/sfx/block-hit.wav');
        this.load.image('background', 'assets/images/background02.png');
        this.load.image('ball', 'assets/images/white-ball.png');
        this.load.image('greenBrick', 'assets/images/green.png');
        this.load.image('orangeBrick', 'assets/images/orange.png');
        this.load.image('whiteBrick', 'assets/images/white.png');
        this.load.image('cyanBrick', 'assets/images/cyan.png');
        this.load.spritesheet('playerPlatform', 'assets/images/platform-blue-1.png', {
            frameWidth: 88,
            frameHeight: 22
        });

        this.liveCounter.preload();
   }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.bgm = this.sound.add('bgm-level1').setVolume(0.2);
        this.ballHit = this.sound.add('ball-hit');
        this.brickHit = this.sound.add('block-hit');
        
        this.liveCounter.create();

        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'verdana, arial, sans-serif'
        });

        this.platform = this.makePlatform({
            x: this.PLATFORM_INNITIAL_POS_X,
            y: this.PLATFORM_INNITIAL_POS_Y
        });

        this.ball = this.makeBall({
            x: this.BALL_INNITIAL_POS_X,
            y: this.BALL_INNITIAL_POS_Y
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bricks = this.makeBricks();

        this.colliders();
    }

    update() {
        this.platform.anims.play('alive', true);
        this.moving(this.cursors, 0);

        if (this.ball.y > 755) {
            this.bgm.stop();
	        if(this.liveCounter.liveLost()) {
                this.setInitialPlatformState();
            } 
        }

        if (this.ball.getData('glue')) {
            this.ball.x = this.platform.x;
            if (this.cursors.up.isDown) {
                this.bgm.play('', { loop: true });
                if (this.ball.getData('glue')) {
                    this.ball.body.setVelocity((10 * Phaser.Math.Between(-30, 30)), this.startSpeed);
                    this.ball.setData('glue', false);
                }
            }
        }
    }
    /****************************************************************************************/
    /****************************************************************************************/
}
