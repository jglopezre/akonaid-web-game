
export class PowerUps {
    constructor(scene) {
        this.relatedScene = scene;
        this.powerUps = this.relatedScene.physics.add.group();
        
    }

    preload() {
        this.relatedScene.load.spritesheet('powerup-capsules', 'assets/images/power-ups.png', {
            frameWidth: 44,
            frameHeight: 22
        } );
    }

    create() {
        
        let white = this.powerUps.create(37, 400, 'powerup-capsules');
        let orange = this.powerUps.create(83, 400, 'powerup-capsules');
        let green = this.powerUps.create(129, 400, 'powerup-capsules');
        let cyan = this.powerUps.create(175, 400, 'powerup-capsules');
        
        for(let i = 0; i < 4; i++) {
            let animationName = ['white-caps', 'orange-caps', 'green-caps', 'cyan-caps'];
            let framesSelector = [[0, 7], [8, 15], [16, 23], [24, 31]];
            this.relatedScene.anims.create({
                key: animationName[i],
                frames: this.relatedScene.anims.generateFrameNumbers('powerup-capsules', {
                    start: framesSelector[i][0],
                    end: framesSelector[i][1]
                }),
                frameRate: 16,
                repeat: -1
            });
        }
               
        white.anims.play('white-caps', true);
        orange.anims.play('orange-caps', true);
        green.anims.play('green-caps', true);
        cyan.anims.play('cyan-caps', true);
    }


}