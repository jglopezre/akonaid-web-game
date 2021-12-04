import { PhaseBase } from "./phase-base.js";

export class Phase02 extends PhaseBase {

    create() {
        this.background = this.relatedScene.add.image(0, 0, 'background02').setOrigin(0, 0);
        this.background.setDepth(-1);
        
        this.bricks = this.relatedScene.physics.add.staticGroup({
            key: [ 'orangeBrick', 'greenBrick', 'whiteBrick', 'cyanBrick' ],
            frameQuantity: 4,
            gridAlign: {
                width: 4,
                height: 4,
                cellWidth: 46,
                cellHeight: 24,
                x: 37,
                y: 250
            }
        });

        this.hardBricks = this.relatedScene.physics.add.sprite(35, 344, 'goldBrick');
        this.hardBricks.body.setImmovable();
     
        this.createHardBrickAnimation();

        /* this.hardBricks = this.relatedScene.physics.add.staticGroup({
            key: ['goldBrick'],
            frameQuantity: 5,
            gridAlign: {
                width: 5,
                height: 1,
                cellWidth: 46,
                cellHeight: 24,
                x: 37,
                y: 346,
            }
        });       */  

        this.configureCollision();
        this.configureHardCollision();

    }

}