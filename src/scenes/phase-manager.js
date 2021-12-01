import { Phase01 } from "./phase-01.js";
import { Phase02 } from "./phase-02.js";

export class PhaseManager {
    constructor(scene) {
        this.relatedScene = scene;
        this.phases = [
            Phase02,
            Phase01
        ];
    }

    preload() {
        this.relatedScene.load.image('greenBrick', 'assets/images/green.png');
        this.relatedScene.load.image('orangeBrick', 'assets/images/orange.png');
        this.relatedScene.load.image('whiteBrick', 'assets/images/white.png');
        this.relatedScene.load.image('cyanBrick', 'assets/images/cyan.png');
        this.relatedScene.load.audio('block-hit', 'assets/sfx/block-hit.wav');
    }

    create() {
        let CurrentPhaseClass = this.phases.pop();
        this.currentPhase = new CurrentPhaseClass(this.relatedScene);
        return this.currentPhase.create();
    }

    nextLevel() {
        if(this.phases.length() === 0) {
            this.relatedScene.endGame(true);
        } else {
            return this.create();
        }
    }

    isPhaseFinished() {
        return this.currentPhase.isPhaseFinished();
    }
}