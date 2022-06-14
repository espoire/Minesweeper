import Board from "./game/Board.js";

const game = new Board(16, 16, 50);

const tableEl = document.getElementById('gameBoard');
const textEl = document.getElementById('gameConfigInfoDisplay')

game.renderTo(tableEl, textEl);