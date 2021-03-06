const Tokenizer = require('./tokenizer.js');

describe('tokenize', () => {
  test('キーワードをトークンに分割できること', async () => {
    const tokenizer = await Tokenizer.build();
    const tokens = tokenizer.tokenize('吾輩は猫である。');
    expect(tokens.map((t) => t.surface)).toEqual([
      '吾輩',
      'は',
      '猫',
      'で',
      'ある',
      '。',
    ]);
  });
});
