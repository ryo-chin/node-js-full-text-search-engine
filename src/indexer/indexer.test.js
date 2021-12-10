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
      text: 'メイン事業にて構築しているWebアプリケーションのフロントエンド開発業務を担当していただきたいと思っています。主な利用言語はTypeScript, JavaScriptです。',
    },
    {
      title: '求人2',
      text: 'サービス保守運用を行うWebアプリケーションの開発に従事していただきたいです。主な利用言語はGolang, JavaScriptです。',
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

  test('文書が保存されること', async () => {
    const input = documents[0];
    const title = input.title;
    const text = input.text;

    const documentId = await indexer.indexDocument(title, text);

    const document = await storage.loadDocument(documentId);
    expect(document.title).toEqual(title);
    expect(document.text).toEqual(text);
  });

  test('インデックスが保存されること', async () => {
    const input = documents[0];
    const title = input.title;
    const text = input.text;
    const token = 'JavaScript';

    const documentId = await indexer.indexDocument(title, text);
    await indexer.flush();

    const index = await storage.loadIndex(token);
    expect(index.indexId).toEqual(token);
    expect(index.postings.map((posting) => posting.documentId)).toEqual([
      documentId,
    ]);
  });

  test('既存のインデックスとマージされて保存されること', async () => {
    const input = documents[0];
    const title = input.title;
    const text = input.text;
    const otherInput = documents[1];
    const otherTitle = otherInput.title;
    const otherText = otherInput.text;
    const token = 'JavaScript';

    const documentId = await indexer.indexDocument(title, text);
    await indexer.flush();
    const otherDocumentId = await indexer.indexDocument(otherTitle, otherText);
    await indexer.flush();

    const sameIndex = await storage.loadIndex(token);
    [documentId, otherDocumentId].forEach((docId) => {
      expect(
        sameIndex.postings.map((posting) => posting.documentId)
      ).toContainEqual(docId);
    });
    expect(sameIndex.postings.length).toEqual(2);
  });
});
