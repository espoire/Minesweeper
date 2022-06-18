import {array, arrShuffle} from '../util/Array.js';
import {Point2D} from '../util/Util.js';
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

  /** Recalculates and applies any changes to the game status text UI. */
  updateStatus() {
    this.renderTargets.status.innerText = this.getStatus();
  }

  /** Recalculates the game status text.
   * @returns {string}
   */
  getStatus() {
    const area = this.width * this.height;
    const unclicked = area - this.clicked;
    const remainingFlags = this.mines - this.flagged;
    const unclickedAndUnflagged = unclicked - this.flagged;
    const minesPerUnclicked = remainingFlags / unclickedAndUnflagged;
    const minesPerUnclickedPercent = (minesPerUnclicked * 100).toFixed(2);

    this.checkWin();

    return [
      `Board: ${this.width}x${this.height}`,
      `Area: ${area} 📐`,
      `Clicked: ${this.clicked} 🔎`,
      `Flagged: ${this.flagged} 🚩`,
      `Unclicked: ${unclicked} ⬜`,
      '',
      `Mines: ${this.mines} 💣`,
      `Flags remaining: ${remainingFlags} 🚩`,
      `Game State: ${this.gameState}`,
      '',
      `Average Chance of Mine in Random Unflagged Cell: ${minesPerUnclickedPercent}% 💥`,
    ].join('\n');
  }

  /** Click handler. Clicks a cell. If it was a "zero", clicks all adjacent cells.
   * @param {Point2D} clicked 
   */
  click(clicked) {
    if (this.gameState !== state.playing) return;
    if (!this.minesPlaced) this.placeMines(clicked);

    const cell = this.board[clicked.x][clicked.y];
    if (cell.clicked || cell.flagged) return;

    this.clicked++;
    cell.click();

    if (cell.mine) {
      this.explode();
      return;
    }

    if (cell.neighbors === 0) {
      for (const neighbor of this.getNeighbors(clicked, eightNeighborhoodOffsets)) {
        this.click(neighbor);
      }
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

  /** Lose the game. */
  explode() {
    setTimeout(() => alert('BOOM 💥'), 1);
    this.gameState = state.lose;
    this.revealRemainingMines();

    this.updateStatus();
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

  /** Board.explode() helper. Displays a 💣 on all cells which had mines. */
  revealRemainingMines() {
    for (const cell of this.cells) {
      cell.revealMine();
    }
  }

  /** Board.win() helper. Displays a 🚩 on all cells which had mines. */
  flagRemainingMines() {
    for (const cell of this.cells) {
      cell.flagMine();
    }
  }

  /** Updates the number of placed flags.
   * @param {number} delta The amount to change the flag count by.
   */
  notifyFlag(delta) {
    this.flagged += delta;

    if (!this.hasFlagsRemaining()) {
      // TODO prompt player to auto-solve when all flags are placed.
    }

    this.updateStatus();
  }

  /**
   * @returns {boolean} `true` if one or more flags remain, `false` otherwise.
   */
  hasFlagsRemaining() {
    return this.flagged < this.mines;
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
