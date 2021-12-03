//@ts-check

/**
 * 文書に含まれるトークンclass
 */
class Token {
  /**
   * @param {string} surface 表層形(文書中に現れるかたちそのままのトークン)
   * @param {string} pos 品詞
   */
  constructor(surface, pos) {
    this.surface = surface;
    this.pos = pos;
  }
}
