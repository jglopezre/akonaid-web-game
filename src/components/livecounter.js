export class LiveCounter {
  constructor(scene, initialLives) {
    this.relatedScene = scene;
    this.initialLives = initialLives;
    this.death = null;
    this.livesSprites = null;
  }

  preload() {
    this.relatedScene.load.image('lives', 'assets/images/lives.png');
    this.relatedScene.load.audio('death', 'assets/sfx/death.wav');
  }

  create() {
    let displacement = 32;
    let firstPosition = 350 - ((this.initialLives - 1) * displacement)

    this.death = this.relatedScene.sound.add('death');

    this.livesSprites = this.relatedScene.physics.add.staticGroup({
      key: 'lives',
      frameQuantity: this.initialLives - 1,
      gridAlign: {
        width: this.initialLives - 1,
        height: 1,
        cellWidth: displacement,
        cellHeight: 32,
        x: firstPosition,
        y: 20
      }
    });
  }

  liveLost() {
    this.death.play();
    if(this.livesSprites.countActive() == 0) {
      this.relatedScene.endGame();
      return false;
    }
    this.livesSprites.getFirstAlive().disableBody(true, true);
    return true;
  }
}