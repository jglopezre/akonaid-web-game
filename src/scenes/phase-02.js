import { PhaseBase } from "./phase-base.js";
const WWIDTH = 5;
const HHEIGHT = 1;
const CELLWWIDTH = 46;
const CELLHHEIGHT = 24;
const XX = 37;
const YY = 370;

export class Phase02 extends PhaseBase {

    create() {
        this.background = this.relatedScene.add.image(0, 0, 'background02').setOrigin(0, 0);
        this.background.setDepth(-1);
        
        this.bricksGroup = this.relatedScene.physics.add.staticGroup();
        this.hardBricksGroup = this.relatedScene.physics.add.staticGroup();

        //first soft-bricks group
       
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 7; j++) {
                this.bricks.push(this.bricksGroup.create(
                    (37 + (CELLWWIDTH * j)),
                    (199 + (CELLHHEIGHT * i)),
                    'orangeBrick')
                    ); 
            }
        }

        // Second bricks group
        for(let j = 0; j < WWIDTH; j++){
            this.bricks.push(this.bricksGroup.create(
                (37 + (CELLWWIDTH * j)),
                (287 + CELLHHEIGHT),
                'whiteBrick')
            );
        }

        for(let j = 0; j < 3; j++){
            this.hardBricks.push(this.hardBricksGroup.create(
                (129 + (CELLWWIDTH * j)),
                (287 + CELLHHEIGHT),
                'goldBrick')
            );
        }

        for(let j = 0; j < 2; j++){
            this.bricks.push(this.bricksGroup.create(
                (267 + (CELLWWIDTH * j)),
                (287 + CELLHHEIGHT),
                'whiteBrick')
            );
        }
        
        //Third bricks group

        for(let j = 0; j < 7; j++){
            this.bricks.push(this.bricksGroup.create(
                (37 + (CELLWWIDTH * j)),
                (335 + CELLHHEIGHT),
                'cyanBrick')
            );
        }

        //Four brick group
        
        for(let j = 0; j < 2; j++){
            this.hardBricks.push(this.hardBricksGroup.create(
                (37 + (CELLWWIDTH * j)),
                (359 + CELLHHEIGHT),
                'goldBrick')
            );
        }

        for(let j = 0; j < 3; j++){
            this.bricks.push(this.bricksGroup.create(
                (129 + (CELLWWIDTH * j)),
                (359 + CELLHHEIGHT),
                'greenBrick')
            );
        }

        for(let j = 0; j < 2; j++){
            this.hardBricks.push(this.hardBricksGroup.create(
                (267 + (CELLWWIDTH * j)),
                (359 + CELLHHEIGHT),
                'goldBrick')
            );
        }

        for(let j = 0; j < 7; j++){
            this.bricks.push(this.bricksGroup.create(
                (37 + (CELLWWIDTH * j)),
                (383 + CELLHHEIGHT),
                'cyanBrick')
            );
        }

        for(let j = 0; j < 7; j++){
            this.bricks.push(this.bricksGroup.create(
                (37 + (CELLWWIDTH * j)),
                (407 + CELLHHEIGHT),
                'whiteBrick')
            );
        }
        
        this.createHardBrickAnimation();
        this.configureCollision();
        this.configureHardCollision();
    }

}