import { PhaseBase } from "./phase-base.js";

export class Phase02 extends PhaseBase {

    create() {

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

        this.configureCollision();
    }
}