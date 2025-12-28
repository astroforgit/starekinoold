import Phaser from 'phaser';
import { preloadGame } from './preloadGame.js';
import { playGame } from './playGame.js';

let gameConfig = {
type: Phaser.CANVAS,
width: 384,
height: 310,
pixelArt: true,
physics: {
    default: "arcade",
    arcade: {
        gravity: {
        y: 0
        }
    }
},
scene: [preloadGame, playGame]
}
const game = new Phaser.Game(gameConfig);