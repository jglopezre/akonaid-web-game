let hardBrickHit = null;
let brickHit = null;

export class PhaseBase {
    constructor(scene) {
        this.relatedScene = scene;
        this.hardBricks = [];
    }
 

    configureCollision() {
        this.relatedScene.physics.add.collider(
            this.relatedScene.ball,
            this.bricks,
            this.relatedScene.brickImpact,
            null,
            this.relatedScene
        )
    }

    configureHardCollision() {
        this.relatedScene.physics.add.collider(
            this.relatedScene.ball,
            this.hardBricks,
            this.relatedScene.hardBrickImpact,
            null,
            this.relatedScene
        )
    }

    createHardBrickAnimation(){
        this.relatedScene.anims.create({
            key: 'goldShine',
            frames: this.relatedScene.anims.generateFrameNumbers('goldBrick', {
                start: 0,
                end: 9
            }),
            frameRate: 10,
            repeat: -1,
            repeatDelay: (2000)
        });

        this.hardBricks.forEach(item => item.anims.play('goldShine', true));
    }
    
    deleteHardBricks() {
        if(this.hardBricks) {
            this.hardBricks.getChildren().forEach( item => {
                item.disableBody(true, true);
            })
        }
    }
   
}   