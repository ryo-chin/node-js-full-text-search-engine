const { buildDefaultIndexer } = require('../test/factory');

test('index', async () => {
  const indexer = await buildDefaultIndexer();
  const storage = indexer.storage;

  const input =
    '全文検索とは、コンピュータにおいて、複数の文書（ファイル）から特定の文字列を検索すること。「ファイル名検索」や「単一ファイル内の文字列検索」と異なり、「複数文書にまたがって、文書に含まれる全文を対象とした検索」という意味で使用される。';
  const documentId = await indexer.addDocument(input);
  await indexer.flush();

  const document = await storage.loadDocument(documentId);
  expect(document.text).toEqual(input);
  const index = await storage.loadIndex('全文');
  expect(index.postings).toEqual([{ documentId: documentId, useCount: 2 }]);

  // 他ドキュメントをインデックスした際、既存Indexに情報が追加されること
  const otherInput =
    '全文検索用のインデックスには様々な形式があるが、最も一般的なものは単語と、単語を含む文書ファイルのIDとで構成された可変長のレコードを持ったテーブルで、転置ファイル（英: inverted file、転置インデックスとも）と呼ばれるものである。';
  const otherDocumentId = await indexer.addDocument(otherInput);
  await indexer.flush();
  const sameIndex = await storage.loadIndex(['全文']);
  expect(sameIndex.postings).toEqual([
    { documentId: documentId, useCount: 2 },
    { documentId: otherDocumentId, useCount: 1 },
  ]);
});
