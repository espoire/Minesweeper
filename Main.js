import Board from "./game/Board.js";

const game = new Board(12, 12, 25);

window.onresize = function () {
  game.setContainerSize(window.innerWidth, window.innerHeight);
};
window.onresize();

const tableEl = document.getElementById('gameBoard');
const textEl = document.getElementById('gameConfigInfoDisplay')
game.renderTo(tableEl, textEl);