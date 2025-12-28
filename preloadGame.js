import Phaser from 'phaser';

export class preloadGame extends Phaser.Scene{
    constructor(){
      super("PreloadGame");
    }
    preload(){
      // load all assets tile sprites
      this.load.image("bg_1", "assets/bg-1.png");
      this.load.image("bg_2", "assets/bg-2.png");
      this.load.image("ground", "assets/ground.png");
        this.load.image("stare", "assets/starekino1.jpg");
      // load spritesheet
      this.load.spritesheet("player1", "assets/bee.png",{
        frameWidth: 37,
        frameHeight: 39
      });

        this.load.spritesheet("player", "assets/qqq.png",{
            frameWidth: 70,
            frameHeight: 150,
        });

        this.load.spritesheet("soldier", "assets/SoldierRun.png",{
            frameWidth: 32,
            frameHeight: 30, // Approximate height provided, frame width is 32. 14 frames.
        });

    }
    create(){
      this.scene.start("PlayGame");
    }
}
