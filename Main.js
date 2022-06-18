import Board from "./game/Board.js";

const game = new Board(12, 12, 25);

window.onresize = function () {
  const headerHeight = document.getElementById('gameInfoDisplay').clientHeight;
  game.setContainerSize(window.innerWidth, window.innerHeight - headerHeight);
};
window.onresize();

const tableEl = document.getElementById('gameBoard');
const textEl = document.getElementById('gameInfoDisplay')
game.renderTo(tableEl, textEl);