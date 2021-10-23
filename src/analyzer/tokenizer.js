const kuromoji = require('kuromoji');
const builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict',
});

class Tokenizer {
  static async build() {
    return new Promise((resolve, reject) => {
      builder.build((err, tokenizer) => {
        if (err) {
          reject(err);
        }
        resolve(new Tokenizer(tokenizer));
      });
    });
  }

  constructor(tokenizer) {
    this.tokenizer = tokenizer;
  }

  tokenize(text) {
    return this.tokenizer.tokenize(text).map((token) => ({
      surface: token.surface_form,
      pos: token.pos,
    }));
  }
}

module.exports = Tokenizer;
