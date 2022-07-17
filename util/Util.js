/** Adds spaces to the front of the given string
 * if it is shorter than the given length.
 * 
 * @param {string} string 
 * @param {number} length 
 * @returns {string}
 */
export function padStringLeft(string, length) {
  while (string.length < length) string = ` ${string}`;
  return string;
}

export class Point2D {
  /**
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    if (typeof x !== 'number') throw new Error('Cannot create Point2D with non-number x-coordinate: ', x);
    if (typeof y !== 'number') throw new Error('Cannot create Point2D with non-number y-coordinate: ', y);

    this.x = x;
    this.y = y;

    Object.freeze(this);
  }

  /**
   * @param {Point2D} that
   * @returns {boolean}
   */
  equals(that) {
    return (this.x == that.x && this.y == that.y);
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.toIdString();
  }

  /**
   * @returns {string}
   */
  toIdString() {
    return `[Point2D: ${this.x},${this.y}]`;
  }

  /**
   * @param {Point2D} that
   * @returns {Point2D}
   */
  add(that) {
    return new Point2D(
      this.x + that.x,
      this.y + that.y
    );
  }
}