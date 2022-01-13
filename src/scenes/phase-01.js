import { PhaseBase } from "./phase-base.js";

export class Phase01 extends PhaseBase {

    create() {
        this.background = this.relatedScene.add.image(0, 0, 'background01').setOrigin(0, 0);
        this.background.setDepth(-1);

        this.bricksGroup = this.relatedScene.physics.add.staticGroup({
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

        this.configureCollision();
    }
}