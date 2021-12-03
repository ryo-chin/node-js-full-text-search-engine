/**
 * Analyzerの前処理を行うCharFilterのInterface用class
 */
class CharFilter {
  /**
   * 文書から対象の文字列を除去、置換する処理
   * - 継承先で実装する
   * @param {string} text
   * @return {string}
   */
  filter(text) {
    throw new Error('Not Implemented');
  }
}

const symbolPattern = /['",]/g;
/**
 * 記号を除去するためのCharFilter
 */
class SymbolFilter extends CharFilter {
  /**
   * トークンに含みたくない記号をspaceに置き換える
   * - spaceは後続処理で除去されることを前提としている
   * @param {string} text
   * @return {string}
   * @override
   */
  filter(text) {
    return text.replace(symbolPattern, ' ');
  }
}

exports.CharFilter = CharFilter;
exports.SymbolFilter = SymbolFilter;
