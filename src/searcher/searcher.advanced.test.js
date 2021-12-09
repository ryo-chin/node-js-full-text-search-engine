const Searcher = require('./searcher');
const { buildDefaultIndexer } = require('../config');

describe('search', () => {
  /**
   * テストデータ
   */
  const documents = [
    {
      title: '求人1',
      text: '機械学習を利用した研究開発経験を優遇します',
    },
    {
      title: '求人2',
      text: '機械を利用した研究開発経験を優遇します',
    },
    {
      title: '求人3',
      text: 'インフラサーバー構築経験をお持ちであると嬉しいです。複数台サーバー構築経験などもあればお話聞かせてください。',
    },
    {
      title: '求人4',
      text: 'サーバーサイド実装経験、インフラサーバー構築経験をお持ちであると嬉しいです。自宅サーバー構築経験などもあればお話聞かせてください。',
    },
    {
      title: '求人5',
      text: 'サーバーサイド経験は必須です',
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

  test('トークンを多く含む文書を先頭にソートできること', async () => {
    const result = await searcher.search('サーバー', 10, false, true);
    expect(result.docs.map((doc) => doc.text)).toEqual([
      documents[3].text,
      documents[2].text,
      documents[4].text,
    ]);
    expect(result.count).toEqual(3);
  });
});
