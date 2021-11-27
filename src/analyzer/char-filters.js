const symbolPattern = /['"]/g;

/**
 * interface
 */
class CharFilter {
  /**
   * @param {string} text
   * @return {string}
   */
  filter(text) {
    throw new Error('Not Implemented');
  }
}

class SymbolFilter extends CharFilter {
  /**
   * @param {string} text
   * @return {string}
   */
  filter(text) {
    return text.replace(symbolPattern, '');
  }
}

exports.CharFilter = CharFilter;
exports.SymbolFilter = SymbolFilter;
