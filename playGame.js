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
        if(this.player.body.touching.down){
            this.playerJumps = 0;
        }
        if(this.playerJumps < gameOptions.jumps){
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

    // set physics bounds to match the level size
    this.physics.world.setBounds(0, 0, 3323 + this.game.config.width, 310);

    // add player
    this.player = this.physics.add.sprite(this.game.config.width * 1.5, 230, "player");
    this.player.setGravityY(gameOptions.playerGravity);
    this.player.setCollideWorldBounds(true);
    this.player.onWorldBounds = true;
    
    // Adjust player hitbox (make it narrower and shorter if needed)
    // Frame is 70x150. Let's try 40x100 centered at bottom.
    this.player.body.setSize(40, 100);
    this.player.body.setOffset(15, 50);

    this.input.on("pointerdown", this.jump, this);
    this.input.keyboard.on("keydown-SPACE", this.jump, this);




    // create an animation for the player
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 5,
      repeat: -1
    });
    this.player.play("fly");

    this.player.play("fly");

    // Create a group for soldiers
    this.soldierGroup = this.physics.add.group();
    // Create a group for pianos
    this.pianoGroup = this.physics.add.group();

    // Set up a timer to spawn soldiers continuously
    this.time.addEvent({
        delay: 2500, // Spawn every 2.5 seconds
        callback: this.spawnSoldier,
        callbackScope: this,
        loop: true
    });

    // Set up a timer to spawn pianos
    this.time.addEvent({
        delay: 4000, // Spawn every 4 seconds
        callback: this.spawnPiano,
        callbackScope: this,
        loop: true
    });

    // Add collision between player and soldiers
    this.physics.add.collider(this.player, this.soldierGroup, this.hitSoldier, null, this);
    // Add collision between player and pianos
    this.physics.add.overlap(this.player, this.pianoGroup, this.hitSoldier, null, this);
    
    // allow key inputs to control the player
    this.cursors = this.input.keyboard.createCursorKeys();


    // set workd bounds to allow camera to follow the player
    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, 3323+this.game.config.width, 310);

    // making the camera follow the player
    this.myCam.startFollow(this.player);

  }

  spawnSoldier() {
     // Spawn soldier at the right edge of the visible camera view + buffer, or fixed world position?
     // Since the camera moves, we should spawn relative to the camera or player.
     // Let's spawn them ahead of the player.
     let spawnX = this.myCam.scrollX + this.game.config.width + 100;
     // Or just hardcode logic if the level is finite. The level is 3323 wide.
     // If the player is near the end, stop spawning? The user said "appearing continuously".
     
     // Let's spawn 800px ahead of player, but ensure it's within world bounds if needed.
     // Simplified: Spawn at camera right edge.
     
     let soldier = this.soldierGroup.create(spawnX, 285, "soldier");
     soldier.setVelocityX(-150); // Move left slightly faster
     soldier.setFlipX(true);
     soldier.setCollideWorldBounds(false);
     soldier.body.allowGravity = false; 
     
     // Adjust soldier hitbox. Frame is 41x50.
     // Make it narrower, e.g., 20x40.
     soldier.body.setSize(20, 40);
     soldier.body.setOffset(10, 10);

     // Animation
     // We need to create the anim once in create(), not every spawn.
     if (!this.anims.exists('soldier_run')) {
        this.anims.create({
            key: "soldier_run",
            frames: this.anims.generateFrameNumbers("soldier", { start: 0, end: 11 }),
            frameRate: 12,
            repeat: -1
        });
     }
     soldier.play("soldier_run");
  }

  spawnPiano() {
      // Spawn within the visible area or slightly ahead
      // Let's spawn it somewhere between current scrollX and scrollX + width
      let minX = this.myCam.scrollX;
      let maxX = this.myCam.scrollX + this.game.config.width;
      let randomX = Phaser.Math.Between(minX, maxX);

      let piano = this.pianoGroup.create(randomX, -100, "piano");
      piano.setScale(0.5); // Increased from 0.15 to 0.5
      piano.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Rotate
      piano.setVelocityY(200); // Initial downward velocity
      
      // Hitbox adjustment for larger scale
      // Original size 319x361. At 0.5 scale, it's ~160x180.
      piano.body.setSize(250, 250); 
      piano.body.setOffset(35, 50);
  }

  hitSoldier(player, soldier) {
      if (this.isGameOver) return;
      this.isGameOver = true;

      // Disable collision so he can fly out of bounds
      this.player.setCollideWorldBounds(false);
      
      // Stop running animation
      this.player.stop();
      this.player.setTint(0xff0000); // Red tint for impact

      // "Fly up 45 degrees" - combined X and Y velocity
      // Assuming fly backwards (left) and up
      this.player.setVelocity(-400, -500); 
      
      // "Rotate"
      this.player.setAngularVelocity(360);
      
      // Disable further input
      this.input.enabled = false;
  }


  update() {
    if (this.isGameOver) {
        // Check if player is off screen (below bottom or above top or too far left/right)
        // Since we fling him Up (-Y), check if Y < -50 or Y > gameHeight
        if (this.player.y < -100 || this.player.y > this.game.config.height + 100) {
            this.scene.restart();
            this.isGameOver = false;
            this.input.enabled = true;
        }
        return; // Skip normal update logic
    }

    // move the player when the arrow keys are pressed
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.scaleX = -1;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.scaleX = 1;
    } else {
      this.player.setVelocityX(0);
    }

    // Recycle soldiers
    this.soldierGroup.children.each((soldier) => {
        if (soldier.active && soldier.x < this.myCam.scrollX - 50) {
            soldier.destroy();
        }
    });

    // Recycle pianos
    this.pianoGroup.children.each((piano) => {
        if (piano.active && piano.y > this.game.config.height + 50) {
            piano.destroy();
        }
    });

    this.stare.tilePositionX = this.myCam.scrollX * .6;
  }
}