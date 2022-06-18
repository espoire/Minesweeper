import Settings from "../Settings.js";
import { Point2D } from "../util/Util.js";

export default class Cell {
  /**
   * @param {Board} parent 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(parent, x, y) {
    this.parent = parent;

    this.mine = false;

    this.clicked = false;
    this.flagged = false;

    this.text = null;
    this.revealed = false;

    this.elements = createMineCellElements(parent, this, x, y);
  }

  /** Permanently alters this Cell to include a mine. */
  placeMine() {
    this.mine = true;
    this.setText('💣');
    if (Settings.debug.showMines) this.revealMine();
  }

  /** TODO
   * @param {string} text 
   */
  setText(text) {
    this.text = text;
    this.elements.text.innerText = text;
    if (this.revealed) this.elements.button.innerText = text;
  }

  /** Records the number of neighbor mines.
   * @param {number} mines 
   */
  setNeighborMineCount(mines) {
    this.neighbors = mines;
    if (!this.mine && mines > 0) this.setText(mines);
  }

  /** TODO */
  click() {
    this.elements.button.style.display = 'none';
    this.elements.text.style.display = null;
    this.clicked = true;

    if (this.mine) {
      this.elements.text.innerText = '💥';
    }
  }

  /** TODO: Update the UI to hide/show a flag on this Cell. */
  toggleFlagged() {
    this.flagged = !this.flagged;

    if (this.flagged) {
      this.elements.button.innerText = '🚩';
    } else {
      if (this.mine && Settings.debug.showMines) {
        this.revealMine();
      } else {
        this.elements.button.innerText = '';
      }
    }
  }

  /** Update the UI to show if there was a mine hiding behind this Cell. */
  revealMine() {
    this.revealed = true;
    if (this.mine) this.elements.button.innerText = '💣';
  }

  /** Update the UI to show a flag on this Cell if it's hiding a mine. */
  flagMine() {
    this.revealed = true;
    if (this.mine) this.elements.button.innerText = '🚩';
  }
}

/** Initializes HTML elements used to display this Cell.
 * 
 * @param {Board} parent 
 * @param {Cell} cell 
 * @param {number} x 
 * @param {number} y 
 * @returns {{
 *   td: HTMLTableCellElement,
 *   button: HTMLButtonElement,
 *   text: HTMLSpanElement,
 * }}
 */
function createMineCellElements(parent, cell, x, y) {
  // Create wrapper table cell element.
  const td = document.createElement('td');
  td.classList.add('mineCell');

  // Create button element, used until the Cell is clicked.
  const button = document.createElement('button');
  button.onclick = function () {
    parent.click(new Point2D(x, y));
  }
  button.oncontextmenu = function () {
    parent.toggleFlag(new Point2D(x, y))
    return false; // Suppress default right-click behavior
  }
  td.appendChild(button);

  // Create text element, used after the Cell is clicked.
  const text = document.createElement('span');
  text.style.display = 'none';
  td.appendChild(text);

  return {td, button, text};
}