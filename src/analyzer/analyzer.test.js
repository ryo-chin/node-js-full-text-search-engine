const Analyzer = require('./analyzer.js');
const Tokenizer = require('./tokenizer.js');
const { POSFilter } = require('./token-filters.js');
const { SymbolFilter } = require('./char-filters.js');

describe('analyzer', () => {
  test('文書をトークンに分割できること', async () => {
    const tokenizer = await Tokenizer.build();
    const analyzer = new Analyzer(tokenizer);

    const tokens = analyzer.analyze(
      '主な利用言語はTypeScript, JavaScriptです。'
    );

    expect(tokens.map((t) => t.surface)).toEqual([
      '主',
      'な',
      '利用',
      '言語',
      'は',
      'TypeScript',
      ',',
      ' ',
      'JavaScript',
      'です',
      '。',
    ]);
  });

  test('文書を不要なトークンを除外して分割できること', async () => {
    const symbolFilter = new SymbolFilter();
    const posFilter = new POSFilter();
    const tokenizer = await Tokenizer.build();
    const analyzer = new Analyzer(tokenizer, [symbolFilter], [posFilter]);

    const tokens = analyzer.analyze(
      '主な利用言語はTypeScript, JavaScriptです。'
    );

    expect(tokens.map((t) => t.surface)).toEqual([
      '主',
      '利用',
      '言語',
      'TypeScript',
      'JavaScript',
    ]);
  });
});
