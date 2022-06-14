import Settings from "../Settings.js";
import { Point2D } from "../util/Util.js";

export default class Cell {
  constructor(parent, x, y) {
    this.mine = false;
    this.clicked = false;
    this.flagged = false;
    this.text = null;
    this.revealed = false;
    this.parent = parent;
    this.elements = createMineCellElements(parent, x, y);
  }

  placeMine() {
    this.mine = true;
    this.setText('💣');
    if (Settings.debug.showMines) this.revealMine();
  }

  setText(text) {
    this.text = text;
    this.elements.text.innerText = text;
    if (this.revealed) this.elements.button.innerText = text;
  }

  setNeighborMineCount(mines) {
    this.neighbors = mines;
    if (!this.mine && mines > 0) this.setText(mines);
  }

  click() {
    this.elements.button.style.display = 'none';
    this.elements.text.style.display = null;

    this.clicked = true;
    if (this.mine) this.parent.explode();
  }

  revealMine() {
    this.revealed = true;
    if (this.mine) this.elements.button.innerText = '💣';
  }
}

function createMineCellElements(parent, x, y) {
  const td = document.createElement('td');
  td.classList.add('mineCell');

  const button = document.createElement('button');
  const text = document.createElement('span');

  text.style.display = 'none';

  button.onclick = function () {
    parent.click(new Point2D(x, y));
  }

  td.appendChild(button);
  td.appendChild(text);

  return {td, button, text};
}