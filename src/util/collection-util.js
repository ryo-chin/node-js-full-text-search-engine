//@ts-check

/**
 * @param {Iterable<any>} array
 */
function toSet(array) {
  return [...new Set(array)];
}

exports.toSet = toSet;
