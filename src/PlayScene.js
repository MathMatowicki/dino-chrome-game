import Phaser from 'phaser';

class PlayScene extends Phaser.Scene {

  constructor() {
    super('PlayScene');
  }

  create() {
    this.gameSpeed = 10;
    const { height, width } = this.game.config;

    this.ground = this.add.tileSprite(0, height, width, 26, 'ground').setOrigin(0, 1);
    this.dino = this.physics.add.sprite(0, height, 'dino-idle').setOrigin(0, 1)
      .setCollideWorldBounds(true)
      .setGravityY(4000);

    this.handleInputs();
    this.initAnims();

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
      frames: this.anims.generateFrameNumbers('dino-bird', { start: 0, end: 1 }), //Fly enemy  animation
      frameRate: 6,
      repeat: -1
    })
  }

  handleInputs() {

    this.input.keyboard.on('keydown_SPACE', () => {
      if (!this.dino.body.onFloor()) { return; } //Prevent from dino ability to fly 
      this.dino.setVelocityY(-1600);
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
    })

    this.input.keyboard.on('keydown_DOWN', () => {
      this.dino.body.height = 58;
      this.dino.body.offset.y = 34;
    })

  }

  update() {
    this.ground.tilePositionX += this.gameSpeed;
    if (this.dino.body.deltaAbsY() > 0) {//Dino jumping?
      this.dino.anims.stop();
      this.dino.setTexture('dino');
    } else {
      this.dino.play('dino-run', true);
    }
  }
}

export default PlayScene;
