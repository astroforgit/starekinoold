import Phaser from 'phaser';

export const gameOptions = {

    // platform speed range, in pixels per second
    platformSpeedRange: [300, 300],

    // spawn range, how far should be the rightmost platform from the right edge
    // before next platform spawns, in pixels
    spawnRange: [80, 300],

    // platform width range, in pixels
    platformSizeRange: [90, 300],

    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,

    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],

    // player gravity
    playerGravity: 900,

    // player jump force
    jumpForce: 400,

    // player starting X position
    playerStartPosition: 200,

    // consecutive jumps allowed
    jumps: 20,

    // % of probability a coin appears on the platform
    coinPercent: 25
}



export class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }


    jump(){
        console.log("jumpp");
        if( (this.playerJumps == 0 || this.playerJumps < gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
        }
    }

  create() {
    this.stare = this.add.tileSprite(0, 0, 3323, 310, "stare");
    // Set its pivot to the top left corner
    this.stare.setOrigin(0, 0);
    // fixe it so it won't move when the camera staremoves.
    // Instead we are moving its texture on the update
    this.stare.setScrollFactor(0);


      this.playerJumps = 0;
    // add player
    this.player = this.add.sprite(this.game.config.width * 1.5, 230, "player");


    /*
    this.player = this.physics.add.sprite(this.game.config.width * 1.5, 230, "player");
    this.player.setGravityY(gameOptions.playerGravity);
     this.player.setCollideWorldBounds(true);
    this.player.onWorldBounds = true;
    this.input.on("pointerdown", this.jump, this);
    */




    // create an animation for the player
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 5,
      repeat: -1
    });
    this.player.play("fly");

    // allow key inputs to control the player
    this.cursors = this.input.keyboard.createCursorKeys();


    // set workd bounds to allow camera to follow the player
    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, 3323+this.game.config.width, 310);

    // making the camera follow the player
    this.myCam.startFollow(this.player);

  }


  update() {

    // move the player when the arrow keys are pressed
    if (this.cursors.left.isDown && this.player.x > 0) {
      this.player.x -= 6;
      this.player.scaleX = -1;

    } else if (this.cursors.right.isDown && this.player.x < 3323+this.game.config.width) {
      this.player.x += 6;
      this.player.scaleX = 1;
    }

    // scroll the textue of the tilesprites proportionally to the camera scroll
    /*
    this.bg_1.tilePositionX = this.myCam.scrollX * .3;
    this.bg_2.tilePositionX = this.myCam.scrollX * .6;
    this.ground.tilePositionX = this.myCam.scrollX;
  */
    this.stare.tilePositionX = this.myCam.scrollX * .6;

  }
}