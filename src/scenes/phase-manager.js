import { Phase01 } from "./phase-01.js";
import { Phase02 } from "./phase-02.js";

export class PhaseManager {
    constructor(scene) {
        this.relatedScene = scene;
        this.phases = [
            Phase02
        ];
    }

    preload() {
        this.relatedScene.load.image('background01', 'assets/images/background01.png');
        this.relatedScene.load.image('background02', 'assets/images/background02.png');

        this.relatedScene.load.image('greenBrick', 'assets/images/green.png');
        this.relatedScene.load.image('orangeBrick', 'assets/images/orange.png');
        this.relatedScene.load.image('whiteBrick', 'assets/images/white.png');
        this.relatedScene.load.image('cyanBrick', 'assets/images/cyan.png');
        
        this.relatedScene.load.spritesheet('goldBrick', 'assets/images/gold-brick.png', {
            frameWidth: 44,
            frameHeight: 22
        });
        this.relatedScene.load.audio('bgm-level1', 'assets/bgm/bgm1.ogg');
        this.relatedScene.load.audio('block-hit', 'assets/sfx/block-hit.ogg');
        this.relatedScene.load.audio('hard-block-hit', 'assets/sfx/steel-hit.ogg');
    }

    create() {
        let CurrentPhaseClass = this.phases.pop();
        this.currentPhase = new CurrentPhaseClass(this.relatedScene);
        this.currentPhase.create();
        this.bricks = this.currentPhase.bricks;
        this.hardBricks = this.currentPhase.hardBricks;
        this.hardBrickShine = this.currentPhase.hardBrickShine;
        return this.currentPhase
    }

    nextLevel() {
        this.currentPhase.deleteHardBricks();
        if(this.phases.length === 0) {
            this.relatedScene.endGame(true);
        } else {
            return this.create();
        }
    }

    isPhaseFinished() {
        return this.currentPhase.isPhaseFinished();
    }

}