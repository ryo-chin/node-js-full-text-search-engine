const { buildDefaultIndexer } = require('../config');
const LocalFileStorage = require('../storage/local-file-storage');
const Indexer = require('./indexer');

describe('index', () => {
  /**
   * テストデータ
   */
  const documents = [
    {
      title: '求人1',
      text: 'サーバーサイド実装経験、インフラサーバー構築経験をお持ちであると嬉しいです。自宅サーバー構築経験などもあればお話聞かせてください。',
    },
  ];

  /** @type {Indexer} */
  let indexer;
  /** @type {LocalFileStorage} */
  let storage;

  /**
   * 各test実行前の準備処理
   * - Indexerの構築
   * - Storageの構築
   */
  beforeEach(async () => {
    indexer = await buildDefaultIndexer();
    storage = indexer.storage;
  });

  test('トークンの利用回数がカウントされること', async () => {
    const input = documents[0];
    const title = input.title;
    const text = input.text;

    const documentId = await indexer.indexDocument(title, text);
    await indexer.flush();

    // noinspection ES6MissingAwait
    [
      { token: 'サーバー', useCount: 3 },
      { token: 'インフラ', useCount: 1 },
    ].forEach(async ({ token, useCount }) => {
      const index = await storage.loadIndex(token);
      const pos = index.postings.find(
        (posting) => posting.documentId === documentId
      );
      expect(pos.useCount).toEqual(useCount);
    });
  });
});
