//@ts-check

class Token {
  /**
   * @param {string} surface 表層形(文書中のトークン)
   * @param {string} pos 品詞
   */
  constructor(surface, pos) {
    this.surface = surface;
    this.pos = pos;
  }
}
