import { array, arrShuffle } from "../util/Array.js";
import { Point2D } from "../util/Util.js";
import Cell from "./Cell.js";

const state = {
  playing: 'Playing 🔎',
  win: 'WIN 🚩',
  lose: 'LOSE 💥',
};

export default class Board {
  constructor(width, height, mines) {
    this.width = width;
    this.height = height;
    this.mines = mines;

    this.initialize();
  }

  initialize() {
    this.board = array(this.width, this.height);
    this.reset();
  }

  reset() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.board[x][y] = new Cell(this, x, y);
      }
    }

    this.minesPlaced = false;
    this.clicked = 0;
    this.flagged = 0;

    this.gameState = state.playing;
  }

  renderTo(containerTableEl, statusTextEl) {
    console.log('Rendering to UI...');

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

  updateStatus() {
    this.renderTargets.status.innerText = this.getStatus();
  }

  getStatus() {
    const area = this.width * this.height;
    const unclicked = area - this.clicked;
    const unclickedAndUnflagged = unclicked - this.flagged;
    const minesPerUnclicked = (this.mines - this.flagged) / unclickedAndUnflagged;
    const minesPerUnclickedPercent = (minesPerUnclicked * 100).toFixed(2);

    if (this.gameState === state.playing && unclicked === this.mines) {
      setTimeout(() => alert('WIN 🎉'), 1);
      this.gameState = state.win;
      this.flagRemainingMines();
    }

    return [
      `Board: ${this.width}x${this.height}`,
      `Area: ${area} 📐`,
      `Clicked: ${this.clicked} 🔎`,
      `Flagged: ${this.flagged} 🚩`,
      `Unclicked: ${unclicked} ⬜`,
      '',
      `Mines: ${this.mines} 💣`,
      `Flags remaining: ${this.mines - this.flagged} 🚩`,
      `Game State: ${this.gameState}`,
      '',
      `Average Chance of Mine in Random Unflagged Cell: ${minesPerUnclickedPercent}% 💥`,
    ].join('\n');
  }

  click(clicked) {
    if (this.gameState !== state.playing) return;
    if (!this.minesPlaced) this.placeMines(clicked);

    const cell = this.board[clicked.x][clicked.y];
    if (cell.clicked || cell.flagged) return;

    this.clicked++;
    cell.click();
    
    if (this.gameState !== state.playing) return;

    if (cell.neighbors === 0) {
      for (const neighbor of this.getNeighbors(clicked)) {
        this.click(neighbor);
      }
    }

    this.updateStatus();
  }

  placeMines(initialClick) {
    console.log(`First click, placing ${this.mines} mines 💣.`)

    const candidateLocations = arrShuffle(
      this.getCandidateLocations(initialClick)
    );

    for (let i = 0; i < this.mines; i++) {
      const location = candidateLocations[i];
      const cell = this.board[location.x][location.y];
      
      cell.placeMine();
    }

    this.minesPlaced = true;

    this.generateCellNeighborNumbers()
  }

  getCandidateLocations(initialClick) {
    const candidateLocations = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (x < initialClick.x - 1 || x > initialClick.x + 1 || y < initialClick.y - 1 || y > initialClick.y + 1) {
          candidateLocations.push(new Point2D(x, y));
        }
      }
    }

    return candidateLocations;
  }

  generateCellNeighborNumbers() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const location = new Point2D(x, y);

        const neighbors = this.getNeighbors(location);
        const mines = neighbors.filter(
          loc => this.board[loc.x][loc.y].mine
        ).length;

        const cell = this.board[x][y];
        cell.setNeighborMineCount(mines);
      }
    }
  }

  getNeighbors(location) {
    const neighbors = [];

    for (const offset of eightNeighborhoodOffsets) {
      const candidateNeighbor = location.add(offset);

      if (0 <= candidateNeighbor.x && candidateNeighbor.x < this.width &&
          0 <= candidateNeighbor.y && candidateNeighbor.y < this.height) {
        neighbors.push(candidateNeighbor);
      }
    }

    return neighbors;
  }

  explode() {
    this.gameState = state.lose;

    alert("BOOM 💥");

    this.revealRemainingMines();
    this.updateStatus();
  }

  revealRemainingMines() {
    for (const cell of this.getCells()) {
      cell.revealMine();
    }
  }

  flagRemainingMines() {
    for (const cell of this.getCells()) {
      cell.flagMine();
    }
  }

  getCells() {
    const ret = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ret.push(this.board[x][y]);
      }
    }

    return ret;
  }

  notifyFlag(delta) {
    this.flagged += delta;

    if(!this.hasFlagsRemaining()) {
      // TODO
    }
    
    this.updateStatus();
  }

  hasFlagsRemaining() {
    return this.flagged < this.mines;
  }
}

const eightNeighborhoodOffsets = [
  new Point2D(-1, -1),
  new Point2D(-1,  0),
  new Point2D(-1,  1),
  new Point2D( 0, -1),
  new Point2D( 0,  1),
  new Point2D( 1, -1),
  new Point2D( 1,  0),
  new Point2D( 1,  1),
]