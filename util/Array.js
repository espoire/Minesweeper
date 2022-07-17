import { randInt } from './Random.js';
import { padStringLeft } from './Util.js';

/** Creates a new blank array with the specified dimension(s).
 * 
 * @param {...number} dimensions 
 * @returns {Array}
 */
export function array(...dimensions) {
  // Create a blank array with the first argument as its size.
  const arr = new Array(dimensions[0] || 0);

  // If any arguments remain,
  if (dimensions.length > 1) {
    const args = dimensions.slice(1);

    // Loop over the slots in the current array...
    let i = dimensions[0];
    while (i--) {

      // ...and fill them with new arrays via recursive
      //    funtion call over the remaining arguments.
      arr[i] = array(args);
    }
  }

  return arr;
}

Array.prototype.pushAll = function (array) {
  for (const element of array) {
    this.push(element);
  }

  return this.length;
};

/** Array Remove - By John Resig (MIT Licensed)
 * Removes elements from an array.
 * 
 * @param {number} from 
 * @param {number} to 
 * @returns {Array}
 */
Array.prototype.remove = function (from, to) {
  const rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push(...rest);
};

/** Returns a random element from a provided array,
 * removing the selected element in the process.
 * 
 * @param {Array} inArray
 * @param {function} [randomFunc]
 *    RNG function to use. Defaults to Math.random.
 * @returns {*}
 */
export function popRandomArrayElement(inArray, randomFunc) {
  const slot = randInt(0, inArray.length - 1, randomFunc);

  const ret = inArray[slot];
  inArray.remove(slot);

  return ret;
}

/** Returns a shallow copy of the input array in randomized order.
 * 
 * @param {Array} array 
 * @param {function} [randomFunc]
 *    RNG function to use. Defaults to Math.random.
 * @returns {Array}
 */
export function arrShuffle(array, randomFunc) {
  // Take a shallow copy of the input array so we're safe to mutate it.
  array = [...array];

  const ret = [];

  // Draw random elements from the copy input array until there are no more.
  while (array.length > 0) {
    ret.push(
      popRandomArrayElement(array, randomFunc)
    );
  }

  return ret;
}

export const prettyPrint2DRectArray = (function () {
  /**
   * @param {*} value 
   * @param {*[]} printAsBlank 
   * @returns {string}
   */
  function toString(value, printAsBlank) {
    if (value === null || value === undefined) return ' ';
    if (printAsBlank.includes(value)) return ' ';

    try {
      return value.toString();
    } catch {
      return value + '';
    }
  }

  return function prettyPrint2DRectArray(array, ...printAsBlank) {
    let longest = 0;

    for (let x = 0; x < array.length; x++) {
      for (let y = 0; y < array[x].length; y++) {
        const stringOf = toString(array[x][y], printAsBlank);
        if (stringOf.length > longest) longest = stringOf.length;
      }
    }

    let prettyPrint = '';

    for (let y = 0; y < array[0].length; y++) {
      for (let x = 0; x < array.length; x++) {
        prettyPrint += padStringLeft(toString(array[x][y], printAsBlank), longest) + ' ';
      }
      prettyPrint += '\n';
    }
    
    console.log(prettyPrint);
  };
})();