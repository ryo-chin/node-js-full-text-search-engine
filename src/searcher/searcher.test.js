const Searcher = require('./searcher');
const { buildDefaultIndexer } = require('../test/factory');

test('search', async () => {
  const indexer = await buildDefaultIndexer();
  const searcher = new Searcher(indexer.analyzer, indexer.storage);
  await indexer.addDocument('本格的な角煮の作り方');
  await indexer.addDocument('手軽な角煮の作り方');
  await indexer.addDocument('ハンバーグの作り方');
  await indexer.flush();

  const result = await searcher.search('角煮');
  expect(result.map((doc) => doc.text)).toEqual([
    '本格的な角煮の作り方',
    '手軽な角煮の作り方',
  ]);
});
