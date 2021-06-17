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

  }

  update() {
    this.ground.tilePositionX += this.gameSpeed;

  }
}

export default PlayScene;
