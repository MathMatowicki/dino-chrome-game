import Phaser from 'phaser';

class PlayScene extends Phaser.Scene {

  constructor() {
    super('PlayScene');
  }

  create() {
    this.isGameRunning = false;
    this.gameSpeed = 10;
    this.respawnTime = 10;
    const { height, width } = this.game.config;

    this.startTrigger = this.physics.add.sprite(0, 10).setOrigin(0, 1).setImmovable();

    this.ground = this.add.tileSprite(0, height, 100, 26, 'ground').setOrigin(0, 1);
    this.dino = this.physics.add.sprite(0, height, 'dino-idle').setOrigin(0, 1)
      .setCollideWorldBounds(true)
      .setGravityY(4000);
    //End screen
    this.gameOverScreen = this.add.container(width / 2, height / 2 - 50).setAlpha(0);
    this.gameOverText = this.add.image(0, 0, 'game-over');
    this.restart = this.add.image(0, 80, 'restart').setInteractive();

    this.gameOverScreen.add([this.gameOverText, this.restart])

    this.obsticles = this.physics.add.group();

    this.initAnims();
    this.initStartTrigger();
    this.initColliders();
    this.handleInputs();

  }
  initColliders() {
    this.physics.add.collider(this.dino, this.obsticles, () => {
      this.physics.pause();
      this.isGameRunning = false;
      this.anims.pauseAll();
      this.dino.setTexture('dino-hurt');
      this.respawnTime = 0;
      this.gameSpeed = 10;
      this.gameOverScreen.setAlpha(1);
    }, null, this)
  }
  initStartTrigger() {
    const { width, height } = this.game.config;
    this.physics.add.overlap(this.startTrigger, this.dino, () => {
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, height);
        return;
      }
      this.startTrigger.disableBody(true, true);

      //Event handling start of the game
      const startEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callbackScope: this,
        callback: () => {
          this.dino.setVelocityX(80);
          this.dino.play('dino-run', 1);
          if (this.ground.width < width) {
            this.ground.width += 17 * 2
          }
          if (this.ground.width >= width) {
            this.ground.width = width;
            this.isGameRunning = true;
            this.dino.setVelocity(0);
            startEvent.remove();
          }
        }
      })

    }, null, this);
  }

  initAnims() {
    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino', { start: 2, end: 3 }), //Running dino animation
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'dino-down-anim',
      frames: this.anims.generateFrameNumbers('dino-down', { start: 0, end: 1 }), //down dino animation
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'enemy-dino-fly',
      frames: this.anims.generateFrameNumbers('enemy-bird', { start: 0, end: 1 }), //Fly enemy  animation
      frameRate: 6,
      repeat: -1
    })
  }

  handleInputs() {

    this.restart.on('pointerdown', () => {
      this.dino.setVelocityY(0);
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
      this.physics.resume();
      this.obsticles.clear(true, true);
      this.isGameRunning = true;
      this.gameOverScreen.setAlpha(0);
      this.anims.resumeAll();
    })

    this.input.keyboard.on('keydown_SPACE', () => {
      if (!this.dino.body.onFloor()) { return; } //Prevent from dino ability to fly 
      this.dino.setVelocityY(-1600);
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
    })
    //if pressed down arrow reduce size of dino
    this.input.keyboard.on('keydown_DOWN', () => {
      this.dino.body.height = 58;
      this.dino.body.offset.y = 34;
    })
    //if realesed down arrow go back to original size of dino
    this.input.keyboard.on('keyup_DOWN', () => {
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
    })

  }

  placeObsticle() {
    const { width, height } = this.game.config;
    const obsticleNum = Math.floor(Math.random() * 7) + 1;
    const distance = Phaser.Math.Between(600, 900);
    let obsticle;

    if (obsticleNum > 6) {
      const enemyHeight = [22, 50];
      obsticle = this.obsticles
        .create(width + distance, height - enemyHeight[Math.floor(Math.random() * 2)], 'enemy-bird');
      obsticle.play('enemy-dino-fly', 1);
      obsticle.body.height = obsticle.body.height / 1.5;
    } else {
      obsticle = this.obsticles.create(width + distance, height, `obsticle-${obsticleNum}`);
      obsticle.body.offset.y += 10;
    }
    obsticle
      .setOrigin(0, 1)
      .setImmovable();
  }

  update(time, delta) {
    if (!this.isGameRunning) { return }
    //fake ground moving
    this.ground.tilePositionX += this.gameSpeed;
    //obsticles moving towards dino
    Phaser.Actions.IncX(this.obsticles.getChildren(), - this.gameSpeed);

    //60*10*0.08
    this.respawnTime += delta * this.gameSpeed * 0.08;

    if (this.respawnTime >= 1500) {
      this.placeObsticle();
      this.respawnTime = 0;
    }
    //Delete obsticles that are off the map
    this.obsticles.getChildren().forEach(obsticle => {
      if (obsticle.getBounds().right < 0) {
        obsticle.destroy();
      }
    })
    if (this.dino.body.deltaAbsY() > 0) {//Dino jumping?
      this.dino.anims.stop();
      this.dino.setTexture('dino');
    } else {
      // animation down-run if height is less than 58px else normal run animation
      this.dino.body.height <= 58 ?
        this.dino.play('dino-down-anim', true) :
        this.dino.play('dino-run', true);
    }
  }
}

export default PlayScene;
