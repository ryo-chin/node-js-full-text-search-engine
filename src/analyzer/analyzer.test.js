const Analyzer = require('./analyzer.js');
const Tokenizer = require('./tokenizer.js');
const tokenFilters = require('./token-filters.js');

test('analyzer with no filter', async () => {
  const tokenizer = await Tokenizer.build();
  const analyzer = new Analyzer(tokenizer, [], []);
  const tokens = analyzer.analyze('吾輩は猫である。名前はまだ無い。');
  expect(tokens.map((t) => t.surface)).toEqual([
    '吾輩',
    'は',
    '猫',
    'で',
    'ある',
    '。',
    '名前',
    'は',
    'まだ',
    '無い',
    '。',
  ]);
});

test('analyzer with token filter', async () => {
  const posFilter = new tokenFilters.POSFilter();
  const tokenizer = await Tokenizer.build();
  const analyzer = new Analyzer(tokenizer, [], [posFilter]);
  const tokens = analyzer.analyze('吾輩は猫である。名前はまだ無い。');
  expect(tokens.map((t) => t.surface)).toEqual([
    '吾輩',
    '猫',
    '名前',
    'まだ',
    '無い',
  ]);
});
