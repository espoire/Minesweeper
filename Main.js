import Board from "./game/Board.js";

// const game = new Board(8, 8, 10);
const game = new Board(15, 15, 35);

window.onresize = function () {
  game.setContainerSize(window.innerWidth, window.innerHeight);
};
window.onresize();

const tableEl = document.getElementById('gameBoard');
const textEl = document.getElementById('gameConfigInfoDisplay')
game.renderTo(tableEl, textEl);