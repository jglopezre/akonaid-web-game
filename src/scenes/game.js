import { LiveCounter } from "../components/livecounter.js";
import { PhaseManager } from "./phase-manager.js";
import { PowerUps } from "../components/powerups.js";

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
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

    brickImpact(ball, bricks) {
        this.brickHit.play();
        bricks.disableBody(true, true);
        this.increasePoints(10);
        if(this.phaseManager.bricksGroup.countActive() === 0) {
            this.phaseManager.nextLevel();
            this.setInitialPlatformState();
        }
    }

    hardBrickImpact(ball, bricks) {
        this.hardBrickHit.play();
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

    

    colliders() {
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.add.collider(this.ball, this.platform, this.platformImpact, null, this);
    }

    setInitialPlatformState() {
        this.platform.x = this.PLATFORM_INNITIAL_POS_X
        this.platform.y = this.PLATFORM_INNITIAL_POS_Y
        this.ball.body.setVelocity(0, 0);
        this.ball.x = this.BALL_INNITIAL_POS_X;
        this.ball.y = this.BALL_INNITIAL_POS_Y;
        this.ball.setData('glue', true);
    }

    /*********SCENE DEFAULT METHODS*************************************************/

    init() {
        this.score = 0;
        this.phaseManager = new PhaseManager(this);
        this.liveCounter = new LiveCounter(this, 3);
        this.powerUps = new PowerUps(this);
    }

    preload() {
        this.load.audio('ball-hit', 'assets/sfx/ball-hit.ogg');
        
        this.load.image('ball', 'assets/images/white-ball.png');
        this.load.spritesheet('playerPlatform', 'assets/images/platform-blue-1.png', {
            frameWidth: 88,
            frameHeight: 22
        });

        this.phaseManager.preload();
        this.powerUps.preload();
        this.liveCounter.preload();
        
   }

    create() {
        
        this.bgm = this.sound.add('bgm-level1').setVolume(0.2);
        this.ballHit = this.sound.add('ball-hit');
        this.hardBrickHit = this.sound.add('hard-block-hit');
        this.brickHit = this.sound.add('block-hit');
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

        this.phaseManager.create();

        this.liveCounter.create();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.colliders();

        this.platform.anims.play('alive', true);
    }

    update() {
        
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
