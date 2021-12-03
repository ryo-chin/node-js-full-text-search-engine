//@ts-check

/**
 * TokenizerのInterface用class
 * {@func Tokenizer.tokenize } を実装した継承classを実装して利用する
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

/**
 * kuromoji(https://www.atilika.com/ja/kuromoji/)を利用したTokenizer class
 * - 辞書は node_modules/kuromoji/dict に内蔵されている
 */
class KuromojiTokenizer extends Tokenizer {
  /**
   * KuromojiTokenizerをbuildする
   * - resolve: buildが完了. Tokenizerインスタンスを返す
   * - reject: Tokenizerのbuildに失敗. errorを返す
   *
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
   * コンストラクタ
   * @param {kuromoji.Tokenizer<kuromoji.IpadicFeatures>} tokenizer
   */
  constructor(tokenizer) {
    super();
    this.tokenizer = tokenizer;
  }

  /**
   * KurmojiTokenizerを利用してテキストをトークンに分割する
   *
   * @override
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
