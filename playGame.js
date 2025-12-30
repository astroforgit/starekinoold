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
    jumps: 2,

    // % of probability a coin appears on the platform
    coinPercent: 25
}



export class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }


    jump(){
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
    // Frame is 70x150.
    // Body height 130 (30% more than previous 100).
    this.player.body.setSize(40, 130);
    this.player.body.setOffset(15, 20); // Moved offset up to accommodate height change

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
    // Create a group for cosmic objects
    this.cosmicGroup = this.physics.add.group();
    // Create a group for python objects
    this.pythonGroup = this.physics.add.group();

    // Set up a timer to spawn soldiers continuously
    this.time.addEvent({
        delay: 4000, // Spawn every 4 seconds (easier)
        callback: this.spawnSoldier,
        callbackScope: this,
        loop: true
    });

    // Set up a timer to spawn pianos
    this.time.addEvent({
        delay: 8000, // Spawn every 8 seconds
        callback: this.spawnPiano,
        callbackScope: this,
        loop: true
    });

    // Set up a timer to spawn cosmic objects
    this.time.addEvent({
        delay: 12000, // Spawn every 12 seconds
        callback: this.spawnCosmic,
        callbackScope: this,
        loop: true
    });

    // Set up a timer to spawn python objects
    this.time.addEvent({
        delay: 10000, // Spawn every 10 seconds
        callback: this.spawnPython,
        callbackScope: this,
        loop: true
    });

    // Add collision between player and soldiers
    this.physics.add.collider(this.player, this.soldierGroup, this.hitSoldier, null, this);
    // Add collision between player and pianos
    this.physics.add.overlap(this.player, this.pianoGroup, this.hitSoldier, null, this);
    // Add collision between player and cosmic objects
    this.physics.add.overlap(this.player, this.cosmicGroup, this.hitSoldier, null, this);
    // Add collision between player and python objects
    this.physics.add.overlap(this.player, this.pythonGroup, this.hitSoldier, null, this);
    
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

  spawnCosmic() {
      let minX = this.myCam.scrollX;
      let maxX = this.myCam.scrollX + this.game.config.width;
      let randomX = Phaser.Math.Between(minX, maxX);

      let cosmic = this.cosmicGroup.create(randomX, -150, "cosmic");
      
      // Create animation if it doesn't exist
      if (!this.anims.exists('cosmic_anim')) {
          this.anims.create({
              key: 'cosmic_anim',
              frames: this.anims.generateFrameNumbers('cosmic', { start: 0, end: 27 }),
              frameRate: 20,
              repeat: -1
          });
      }
      cosmic.play('cosmic_anim');

      cosmic.setScale(0.8); 
      cosmic.setAngularVelocity(Phaser.Math.Between(-150, 150)); 
      cosmic.setVelocityY(150);
      
      // Hitbox adjustment for 192x108 frame
      cosmic.body.setSize(80, 80); 
      cosmic.body.setOffset(56, 14);
  }

  spawnPython() {
     let spawnX = this.myCam.scrollX + this.game.config.width + 100;
     
     // Spawn higher to align bottom. Player bottom ~305.
     // Frame height 46 * 3 = 138. 305 - 138/2 = ~236.
     let python = this.pythonGroup.create(spawnX, 236, "python");
     python.setVelocityX(-120); 
     python.setFlipX(true);
     python.setCollideWorldBounds(false);
     python.body.allowGravity = false;
     
     // Animation
     if (!this.anims.exists('python_anim')) {
        this.anims.create({
            key: 'python_anim',
            frames: this.anims.generateFrameNumbers('python', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
     }
     python.play('python_anim');
     
     python.setScale(3.0); // Scale 300%
     
     // Hitbox adjustment for scale 3.0
     // Visual size: ~100x138.
     python.body.setSize(20, 40); // Base size before scale? No, setSize is relative to unscaled? 
     // Phaser bodies scale with the sprite unless sync is weird. 
     // Usually better to set size close to frame size and let scale handle it, or specific pixels.
     // Let's set it to match the visual "man" part.
     python.body.setSize(20, 35); 
     python.body.setOffset(6, 6); 
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

    // Reset jump counter when touching down or blocked by world bounds bottom
    if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.playerJumps = 0;
    }

    // move the player when the arrow keys are pressed
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
      // If the body is too far right (offset 15), we need to shift it left?
      // Or if flipX handles texture but body stays...
      // Let's try adjusting offset for flip.
      // If it looks "on the right", we need to move the body LEFT.
      // Let's try offset 0? Or maybe negative? No, offset is 0 to width.
      // Let's keep 15 but ensure flip works.
      this.player.body.setOffset(15, 20); 
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
      this.player.body.setOffset(15, 20);
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

    // Recycle cosmic objects
    this.cosmicGroup.children.each((cosmic) => {
        if (cosmic.active && cosmic.y > this.game.config.height + 50) {
            cosmic.destroy();
        }
    });

    // Recycle python objects
    this.pythonGroup.children.each((python) => {
        if (python.active && python.x < this.myCam.scrollX - 100) {
            python.destroy();
        }
    });

    this.stare.tilePositionX = this.myCam.scrollX * .6;
  }
}