// Returns a random integer from min to max (inclusive).
// Optionally, may specify a random function to use in place of Math.random();
export function randInt(min, max, randomFunc = Math.random) {
    const roll = (randomFunc || Math.random)();
    return Math.floor(roll * (max - min + 1)) + min;
}

// roundRandom - Rounds a number to a nearby integer, randomly.
//   Example: 1.2 will become either 1 or 2. 80% will be 1, 20% will be 2.
export function roundRandom(amount, randomFunc) {
    const roll = (randomFunc || Math.random)();

    if(roll < amount % 1) {
        return Math.ceil(amount);
    } else {
        return Math.floor(amount);
    }
}