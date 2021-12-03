//@ts-check

/**
 * Analyzerの後処理を行うTokenFilterのInterface用class
 */
class TokenFilter {
  /**
   * 特定のトークンを除去する処理
   * - 継承先で実装する
   * @param {Token} token
   * @return {Token | null}
   */
  filter(token) {
    throw new Error('Not Implemented');
  }
}

const skipPos = ['接続詞', '助詞', '助動詞', '記号', '接頭詞'];
class POSFilter extends TokenFilter {
  /**
   * インデックスには不要な特定の品詞を除去するTokenFilter
   * @param {Token} token
   * @return {Token | null}
   */
  filter(token) {
    return !skipPos.includes(token.pos) ? token : null;
  }
}

exports.TokenFilter = TokenFilter;
exports.POSFilter = POSFilter;
