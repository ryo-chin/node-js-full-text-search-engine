//@ts-check

/**
 * @param {string} text
 * @param {number} limit
 * @return {string}
 */
function ellipsis(text, limit) {
  return text.length > limit ? text.slice(0, limit) + '...' : text;
}

exports.ellipsis = ellipsis;
