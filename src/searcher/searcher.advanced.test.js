const Searcher = require('./searcher');
const { buildDefaultIndexer } = require('../config');

describe('search', () => {
  /**
   * テストデータ
   */
  const documents = [
    {
      title: '求人4',
      text: '機械学習を利用した研究開発経験を優遇します',
    },
    {
      title: '求人5',
      text: '機械を利用した研究開発経験を優遇します',
    },
  ];

  /** @type {Searcher} */
  let searcher;

  /**
   * 各test実行前の準備処理
   * - Searcherの構築
   * - テストデータのインデックス
   */
  beforeEach(async () => {
    const indexer = await buildDefaultIndexer();
    searcher = new Searcher(indexer.analyzer, indexer.storage);

    for (const input of documents) {
      await indexer.indexDocument(input.title, input.text);
    }
    await indexer.flush();
  });

  test('AND検索できること', async () => {
    const result = await searcher.search('機械学習', 10, true);
    expect(result.docs.map((doc) => doc.text)).toEqual([documents[0].text]);
    expect(result.count).toEqual(1);
  });
});
