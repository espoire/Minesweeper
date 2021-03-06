import Settings from '../Settings.js';
import {array, arrShuffle, prettyPrint2DRectArray} from '../util/Array.js';
import CSS from '../util/CSS.js';
import {Point2D} from '../util/Util.js';
import AI from './AI.js';
import Cell from './Cell.js';

const state = {
  playing: 'Playing 🔎',
  win: 'WIN 🚩',
  lose: 'LOSE 💥',
};

export default class Board {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} mines
   */
  constructor(width, height, mines) {
    this.width = width;
    this.height = height;
    this.mines = mines;

    this.initialize();
  }

  /** Performs first-time setup. */
  initialize() {
    this.board = array(this.width, this.height);
    this.cells = array(this.width * this.height);

    this.reset();
  }

  /** Resets the board to a fresh state. */
  reset() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[this.height * x + y] = this.board[x][y] = new Cell(this, x, y);
      }
    }

    this.minesPlaced = false;
    this.clicked = 0;
    this.flagged = 0;

    this.gameState = state.playing;
  }

  /**
   * @param {HTMLTableElement} containerTableEl 
   * @param {HTMLDivElement} statusTextEl 
   */
  renderTo(containerTableEl, statusTextEl) {
    this.renderTargets = {
      board: containerTableEl,
      status: statusTextEl,
    };

    for (let y = 0; y < this.height; y++) {
      const rowEl = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        rowEl.appendChild(this.board[x][y].elements.td);
      }

      this.renderTargets.board.appendChild(rowEl);
    }

    this.updateStatus();
  }

  /** UI event handler, handles scaling the Minesweeper Board to its
   * container's new size.
   * 
   * @param {number} containerWidth 
   * @param {number} containerHeight 
   */
  setContainerSize(containerWidth, containerHeight) {
    const borderThickness = 5;

    const innerWidth = containerWidth - borderThickness * 2;
    const innerHeight = containerHeight - borderThickness * 2;

    const maxCellWidth = innerWidth / this.width;
    const maxCellHeight = innerHeight / this.height;
    const cellSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));

    const fontSize = Math.floor((cellSize - 5) * 2/3);
    const buttonFontSize = Math.floor(fontSize * 2/3);

    CSS.updateRule('.mineCell > div', `{
      width: ${cellSize}px;
      height: ${cellSize}px;
      overflow: hidden;
    }`);
    
    CSS.updateRule('.mineCell > div > button', `{
      width: ${cellSize}px;
      height: ${cellSize}px;
      font-size: ${buttonFontSize}pt;
      padding: 0;
      border-radius: 5px;
    }`);

    CSS.updateRule('.mineCell > div > span', `{
      line-height: ${cellSize}px;
      font-size: ${fontSize}pt;
      font-weight: bold;
    }`);
  }

  /** Recalculates and applies any changes to the game status text UI. */
  updateStatus() {
    this.checkWin();

    if (Settings.features.showStatusText) {
      this.renderTargets.status.innerText = this.getStatus();
    }

    if (Settings.debug.logInferences) {
      prettyPrint2DRectArray(
        this.toSummaryArray()
      );
      for (const inference of AI.firstOrderInfer(this.toSummaryArray())) {
        console.log(inference.toString());
      }
    }

    if (Settings.features.autoPlayInferences.enabled) {
      const board = this;
      const inference = AI.firstOrderInfer(this.toSummaryArray())[0];

      if (inference) {
        setTimeout(
          function () {
            inference.play(board);
          },
          Settings.features.autoPlayInferences.delay
        );
      }
    }
  }

  /** Recalculates the game status text.
   * @returns {string}
   */
  getStatus() {
    const remainingFlags = this.mines - this.flagged;
    // const area = this.width * this.height;
    // const unclicked = area - this.clicked;
    // const unclickedAndUnflagged = unclicked - this.flagged;
    // const minesPerUnclicked = remainingFlags / unclickedAndUnflagged;
    // const minesPerUnclickedPercent = (minesPerUnclicked * 100).toFixed(2);

    return [
      `${this.mines} 💣    ${remainingFlags} 🚩`,
      // `Board: ${this.width}x${this.height}`,
      // `Area: ${area} 📐`,
      // `Clicked: ${this.clicked} 🔎`,
      // `Flagged: ${this.flagged} 🚩`,
      // `Unclicked: ${unclicked} ⬜`,
      // '',
      // `Mines: ${this.mines} 💣`,
      // `Flags remaining: ${remainingFlags} 🚩`,
      // `Game State: ${this.gameState}`,
      // '',
      // `Average Chance of Mine in Random Unflagged Cell: ${minesPerUnclickedPercent}% 💥`,
    ].join('\n');
  }

  /** Click handler. "Clicks" a cell. If it was a "zero", clicks all adjacent cells.
   * @param {Point2D} clickLocation 
   * @param {boolean} isRecursiveCall 
   */
  click(clickLocation, isRecursiveCall = false) {
    if (this.gameState !== state.playing) return;
    if (!this.minesPlaced) this.placeMines(clickLocation);

    const cell = this.board[clickLocation.x][clickLocation.y];
    if (cell.clicked || cell.flagged) return;

    this.clicked++;
    cell.click();

    if (cell.mine) {
      this.explode();
      return;
    }

    if (cell.neighborMinesCount === 0) {
      for (const neighbor of this.getNeighbors(clickLocation, eightNeighborhoodOffsets)) {
        this.click(neighbor, true);
      }
    }

    if (!isRecursiveCall) this.updateStatus();
  }

  /** Right-click handler. Plants or removes a flag on a cell.
   * @param {Point2D} clickLocation
   */
  toggleFlag(clickLocation) {
    if (this.gameState !== state.playing) return;

    const cell = this.board[clickLocation.x][clickLocation.y];
    if (cell.clicked) return;

    // If we're trying to place a flag AND we're out of flags, show an error.
    if (!cell.flagged && this.getRemainingFlags() <= 0) {
      alert('Out of flags... 🚫🚩');
      return;
    }

    cell.toggleFlagged();

    if (cell.flagged) {
      this.flagged++;
      
      if (this.getRemainingFlags() <= 0) {
        // TODO prompt player to auto-solve when all flags are placed.
      }
    } else {
      this.flagged--;
    }

    this.updateStatus();
  }

  /** Randomly places mines, avoiding the 9-neighborhood around the player's first click.
   * @param {Point2D} initialClick 
   */
  placeMines(initialClick) {
    arrShuffle(
      this.getCandidateLocations(initialClick),
    ).slice(0, this.mines).forEach((cell) =>
      cell.placeMine()
    );

    this.minesPlaced = true;

    this.generateCellNeighborNumbers();
  }

  /** Helper for Board.placeMines(). Generates a list of all valid cell locations.
   * @param {Point2D} initialClick 
   * @returns {Cell[]}
   */
  getCandidateLocations(initialClick) {
    const clickNeighbors = this.getNeighbors(
      initialClick,
      nineNeighborhoodOffsets
    ).map((loc) =>
      this.board[loc.x][loc.y]
    );

    return this.cells.filter((cell) =>
      ! clickNeighbors.includes(cell)
    );
  }

  /** Counts and stores the number of adjacent (8-neighborhood) mines for each Cell. */
  generateCellNeighborNumbers() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const location = new Point2D(x, y);

        const neighbors = this.getNeighbors(location, eightNeighborhoodOffsets);
        const mines = neighbors.filter(
          (loc) => this.board[loc.x][loc.y].mine,
        ).length;

        const cell = this.board[x][y];
        cell.setNeighborMineCount(mines);
      }
    }
  }

  /** Returns a list of all valid locations within this Board in the 8-neighborhood around a location.
   * @param {Point2D} location
   * @param {Point2D[]} offsets
   * @returns {Point2D[]}
   */
  getNeighbors(location, offsets) {
    return offsets.map((offset) =>
      location.add(offset)
    ).filter((loc) =>
      0 <= loc.x && loc.x < this.width &&
      0 <= loc.y && loc.y < this.height
    );
  }

  /** Check if the game is won, and win if so. */
  checkWin() {
    if (this.gameState !== state.playing) return;

    const area = this.width * this.height;
    const unclicked = area - this.clicked;

    if (unclicked === this.mines) {
      this.win();
    }
  }

  /** Win the game. */
  win() {
    setTimeout(() => alert('WIN 🎉'), 1);
    this.gameState = state.win;
    this.flagRemainingMines();
  }

  /** Lose the game. */
  explode() {
    setTimeout(() => alert('BOOM 💥'), 1);
    this.gameState = state.lose;
    this.revealRemainingMines();

    this.updateStatus();
  }

  /** Board.explode() helper. Displays a 💣 on all cells which had mines. */
  revealRemainingMines() {
    for (const cell of this.cells) {
      cell.revealMine();
    }
  }

  /** Board.win() helper. Displays a 🚩 on all cells which had mines. */
  flagRemainingMines() {
    for (const cell of this.cells) {
      cell.revealMineAsFlag();
    }
  }

  /**
   * @returns {boolean} `true` if one or more flags remain, `false` otherwise.
   */
  getRemainingFlags() {
    return this.mines - this.flagged;
  }

  /**
   * @returns {(string[])[]}
   *    A rectangular 2D array of chars representing the board status.
   *    See comment on Cell.toSummarChar() for the character encodings.
   */
  toSummaryArray() {
    const ret = array(this.width, this.height);
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ret[x][y] = this.board[x][y].toSummaryChar();
      }
    }

    return ret;
  }
}

const eightNeighborhoodOffsets = [
  new Point2D(-1, -1),
  new Point2D(-1, 0),
  new Point2D(-1, 1),
  new Point2D( 0, -1),
  new Point2D( 0, 1),
  new Point2D( 1, -1),
  new Point2D( 1, 0),
  new Point2D( 1, 1),
];

const nineNeighborhoodOffsets = [
  ...eightNeighborhoodOffsets,
  new Point2D(0, 0),
];