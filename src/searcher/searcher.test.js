const Searcher = require('./searcher');
const { buildDefaultIndexer } = require('../config');

describe('search', () => {
  /**
   * テストデータ
   */
  const documents = [
    {
      title: '求人1',
      text: 'メイン事業にて構築しているWebアプリケーションのフロントエンド開発業務を担当していただきたいと思っています。主な利用言語はTypeScript, JavaScriptです。',
    },
    {
      title: '求人2',
      text: 'サービス保守運用を行うWebアプリケーションの開発に従事していただきたいです。主な利用言語はGolang, JavaScriptです。',
    },
    {
      title: '求人3',
      text: 'データベースサーバの構築・設計を行っていただきたいです。LinuxやSQLの利用経験を優遇します。',
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

    documents.forEach(async (input) => {
      await indexer.indexDocument(input.title, input.text);
    });
    await indexer.flush();
  });

  test('search all', async () => {
    const result = await searcher.search('JavaScript');
    expect(result.docs.map((doc) => doc.text)).toEqual([
      documents[0].text,
      documents[1].text,
    ]);
  });

  test('search with limit', async () => {
    const limit = 1;
    const result = await searcher.search('JavaScript', limit);
    expect(result.docs.map((doc) => doc.text)).toEqual([documents[0].text]);
    expect(result.count).toEqual(2);
  });
});
