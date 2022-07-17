import Settings from '../Settings.js';
import { Point2D } from '../util/Util.js';

export default class Cell {
  /**
   * @param {Board} parent
   * @param {number} x
   * @param {number} y
   */
  constructor(parent, x, y) {
    /** @type {boolean} If true, this cell contains a mine. */
    this.mine = false;
    /** @type {number | null} The number of adjacent cells which contain a mine. */
    this.neighborMinesCount = null;

    /** @type {boolean} If true, hides the button and shows what was behind the cell. */
    this.clicked = false;
    /** @type {boolean} If true, displays a flag on the button. */
    this.flagged = false;
    /** @type {boolean} If true, shows mines even if unclicked. */
    this.revealed = false;

    /** Object containing the HTML elements used for rendering.
     * @type {{
     *   td: HTMLTableCellElement,
     *   divWrapper: HTMLDivElement,
     *   button: HTMLButtonElement,
     *   text: HTMLSpanElement,
     * }}
     */
    this.elements = createMineCellElements(parent, this, x, y);
  }

  /** Update the UI to place a mine in this cell. (Not visible unless revealed by settings.) */
  placeMine() {
    this.mine = true;
    redraw(this);
  }

  /** Records the number of neighbor mines.
   * @param {number} mines 
   */
  setNeighborMineCount(mines) {
    this.neighborMinesCount = mines;
    redraw(this);
  }

  /** Update the UI to reveal what was behind this cell. */
  click() {
    this.clicked = true;
    redraw(this);
  }

  /** Update the UI to hide/show a flag on this cell. */
  toggleFlagged() {
    this.flagged = !this.flagged;
    redraw(this);
  }

  /** Update the UI at the end of a lost game to show if there was a mine hiding behind this Cell. */
  revealMine() {
    this.revealed = true;
    redraw(this);
  }

  /** Update the UI at the end of a won game to show a flag on this Cell if it's hiding a mine. */
  revealMineAsFlag() {
    this.flagged = true;
    redraw(this);
  }

  /**
   * @returns {string}
   *    A char representing the cell status.
   *    "*" - clicked (exploded) mine
   *    " " - clicked & safe, with zero neighbor mines
   *    "1" - clicked & safe with 1 neighbor mine
   *    "2" - clicked & safe with 2 neighbor mines
   *    ... etc
   *    "?" - unclicked, without flag
   *    "F" - unclicked, with flag
   */
  toSummaryChar() {
    if (this.clicked) {
      if (this.mine) return '*';
      return this.neighborMinesCount || ' ';
    }

    if (this.flagged) return 'F';
    return '?';
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
 *   divWrapper: HTMLDivElement,
 *   button: HTMLButtonElement,
 *   text: HTMLSpanElement,
 * }}
 */
function createMineCellElements(parent, cell, x, y) {
  // Create table cell element.
  const td = document.createElement('td');
  td.classList.add('mineCell');

  // Create wrapper div element.
  const div = document.createElement('div');
  td.appendChild(div);

  // Create button element, used until the Cell is clicked.
  const button = document.createElement('button');
  button.onclick = function () {
    parent.click(new Point2D(x, y));
  };
  button.oncontextmenu = function () {
    parent.toggleFlag(new Point2D(x, y));
    return false; // Suppress default right-click behavior
  };
  div.appendChild(button);

  // Create text element, used after the Cell is clicked.
  const text = document.createElement('span');
  td.classList.add('center');
  text.style.display = 'none';
  div.appendChild(text);

  return {td, div, button, text};
}

/** Update the UI based on the Cell's state.
 * @param {Cell} cell 
 */
function redraw(cell) {
  if (cell.clicked) {
    // Hide button, show text.
    cell.elements.button.style.display = 'none';
    cell.elements.text.style.display = null;

    // If exploded, show an explosion.
    if (cell.mine) {
      cell.elements.text.innerText = '💥';

    // Otherwise show the neighbor mines count.
    } else {
      cell.elements.text.innerText = cell.neighborMinesCount || '';
    }

  } else { // Cell is "unclicked".
    // Hide text, show button.
    cell.elements.button.style.display = null;
    cell.elements.text.style.display = 'none';

    // If flagged, show a flag.
    if (cell.flagged) {
      cell.elements.button.innerText = '🚩';
    } else {

      // If it has a mine and is revealed, show a mine.
      if (cell.mine && (cell.revealed || Settings.debug.showMines)) {
        cell.elements.button.innerText = '💣';
      
      // Otherwise show nothing.
      } else {
        cell.elements.button.innerText = '';
      }
    }
  }
}