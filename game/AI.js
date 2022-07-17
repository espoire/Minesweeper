import { Point2D } from '../util/Util.js';

export default class AI {
  /**
   * @param {(string[])[]} boardSummary 
   *    A rectangular 2D array of chars representing a Minesweeper board.
   *    See comment on Board.toSummaryArray() for more info.
   * @returns {Inference[]}
   */
  static firstOrderInfer(boardSummary) {
    const board = toBoardState(boardSummary);

    const inferences = [];
    for (let x = 0; x < boardSummary.length; x++) {
      for (let y = 0; y < boardSummary[x].length; y++) {
        inferences.pushAll(
          AI.firstOrderInferAt(x, y, board)
        );
      }
    }

    return removeDuplicates(inferences);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {(CellState[])[]} board
   * @returns {Inference[]}
   */
  static firstOrderInferAt(x, y, board) {
    const targetCell = board[x][y];
    if (!targetCell.isSafe || targetCell.neighborMines === 0) return [];

    const neighbors = getNeighbors(targetCell, board);

    const knownMines = neighbors.filter((n) => n.isMine);
    const unknowns = neighbors.filter((n) => !n.isMine && !n.isSafe);

    const unknownMineCount = targetCell.neighborMines - knownMines.length;

    if (unknownMineCount === unknowns.length) {
      return unknowns.map((cell) => new Inference(
        'mine',
        cell.location(),
      ));

    } else if (unknownMineCount === 0) {
      return unknowns.map((cell) => new Inference(
        'safe',
        cell.location(),
      ));
    }

    return [];
  }
}

/**
 * @param {Inference[]} inferences
 * @returns {Inference[]}
 */
function removeDuplicates(inferences) {
  const uniques = [];

  for (const inference of inferences) {
    if (
      ! uniques.some((unique) =>
        unique.equals(inference)
      )
    ) {
      uniques.push(inference);
    }
  }

  return uniques;
}

/**
 * @param {(string[])[]} boardSummary 
 *    A rectangular 2D array of chars representing a Minesweeper board.
 *    See comment on Board.toSummaryArray() for more info.
 * @returns {(CellState[])[]}
 */
function toBoardState(boardSummary) {
  const {width, height} = sizeOf(boardSummary);
  const ret = [];

  for (let x = 0; x < width; x++) {
    ret[x] = [];

    for (let y = 0; y < height; y++) {
      ret[x][y] = new CellState(x, y, boardSummary[x][y]);
    }
  }

  return ret;
}

/**
 * @param {CellState} cell 
 * @param {(CellState[])[]} board 
 * @returns {CellState[]}
 */
function getNeighbors(cell, board) {
  const location = cell.location();
  const {width, height} = sizeOf(board);

  return eightNeighborhoodOffsets.map((offset) =>
    location.add(offset)
  ).filter((loc) =>
    0 <= loc.x && loc.x < width &&
    0 <= loc.y && loc.y < height
  ).map(
    (loc) => board[loc.x][loc.y]
  );
}

/**
 * @param {(*[])[]} board 
 * @returns {{
 *   width: number,
 *   height: number
 * }}
 */
function sizeOf(board) {
  return {
    width: board.length,
    height: board[0].length,
  };
}

class CellState {
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {string} charSummary 
   */
  constructor(x, y, charSummary) {
    this.x = x;
    this.y = y;

    if ('*F'.includes(charSummary)) this.isMine = true;
    if (' 12345678'.includes(charSummary)) {
      this.isSafe = true;
      this.neighborMines = Number(charSummary);
    }
  }

  /**
   * @returns {Point2D}
   */
  location() {
    return new Point2D(this.x, this.y);
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

class Inference {
  /**
   * @param {string} type 
   * @param {Point2D} location 
   */
  constructor(type, location) {
    this.type = type;
    this.location = location;
  }

  /**
   * @param {Inference} another
   * @returns {boolean}
   */
  equals(another) {
    return this.type == another.type &&
      this.location.equals(another.location);
  }

  /**
   * @returns {string}
   */
  toString() {
    const descriptionOf = {
      safe: 'safe',
      mine: 'a mine',
    };

    return `(${this.location.x}, ${this.location.y}) is ${descriptionOf[this.type]}`;
  }
}