import { Game } from "./Game";

const element = document.getElementById("pixi-container");
if (!element) {
  throw new Error("No element with id 'pixi-container' found");
}

const game = new Game(element);

// Iniciar el juego
game.run();
