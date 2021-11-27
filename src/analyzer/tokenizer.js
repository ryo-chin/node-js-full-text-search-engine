//@ts-check

/**
 * interface
 */
class Tokenizer {
  /**
   * @param {string} text
   * @return {Token[]}
   */
  tokenize(text) {
    throw new Error('Not Implemented');
  }
}

const kuromoji = require('kuromoji');
const builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict',
});

class KuromojiTokenizer extends Tokenizer {
  /**
   * @returns {Promise<KuromojiTokenizer>}
   */
  static async build() {
    return new Promise((resolve, reject) => {
      builder.build((err, tokenizer) => {
        if (err) {
          reject(err);
        }
        resolve(new KuromojiTokenizer(tokenizer));
      });
    });
  }

  /**
   * @param {kuromoji.Tokenizer<kuromoji.IpadicFeatures>} tokenizer
   */
  constructor(tokenizer) {
    super();
    this.tokenizer = tokenizer;
  }

  /**
   * @param {string} text
   * @return {Token[]}
   */
  tokenize(text) {
    return this.tokenizer.tokenize(text).map((token) => ({
      surface: token.surface_form,
      pos: token.pos,
    }));
  }
}

exports.Tokenizer = Tokenizer;
module.exports = KuromojiTokenizer;
