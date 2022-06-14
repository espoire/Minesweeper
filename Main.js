import Board from "./game/Board.js";

const game = new Board(8, 8, 10);

const tableEl = document.getElementById('gameBoard');
const textEl = document.getElementById('gameConfigInfoDisplay')

game.renderTo(tableEl, textEl);