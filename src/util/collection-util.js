//@ts-check

/**
 * @param {Iterable<any>} array
 * @return {any[]}
 */
function toSet(array) {
  return [...new Set(array)];
}

exports.toSet = toSet;
