export class PhaseBase {
    constructor(scene) {
        this.relatedScene = scene;
    }

    configureCollision() {
        this.relatedScene.physics.add.collider(
            this.relatedScene.ball,
            this.bricks,
            this.relatedScene.brickImpact,
            null,
            this.relatedScene)
            console.log('AQUI');
    }

    isPhaseFinished() {
        return (this.bricks.countActive() === 0);
    }
}   