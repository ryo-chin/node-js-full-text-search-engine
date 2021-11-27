//@ts-check

/**
 * interface
 */
class TokenFilter {
  /**
   * @param {Token} token
   * @return {Token | null}
   */
  filter(token) {
    throw new Error('Not Implemented');
  }
}

const skipPos = ['助詞', '助動詞', '記号', '接頭詞'];
class POSFilter extends TokenFilter {
  /**
   * @param {Token} token
   * @return {Token | null}
   */
  filter(token) {
    return !skipPos.includes(token.pos) ? token : null;
  }
}

exports.TokenFilter = TokenFilter;
exports.POSFilter = POSFilter;
