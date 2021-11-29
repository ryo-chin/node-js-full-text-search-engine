const Searcher = require('./searcher');
const { buildDefaultIndexer } = require('../config');

test('search', async () => {
  const indexer = await buildDefaultIndexer();
  const searcher = new Searcher(indexer.analyzer, indexer.storage);
  const inputs = [
    {
      title: '角煮',
      text: '本格的な角煮の作り方',
    },
    {
      title: '角煮',
      text: '手軽な角煮の作り方',
    },
    {
      title: 'ハンバーグ',
      text: 'ハンバーグの作り方',
    },
    {
      title: '角煮',
      text: 'とろとろ角煮の作り方',
    },
  ];
  inputs.forEach(async (input) => {
    await indexer.addDocument(input.title, input.text);
  });
  await indexer.flush();

  const limit = 2;
  const result = await searcher.search('角煮', limit);
  expect(result.count).toEqual(3);
  expect(result.docs.map((doc) => doc.text)).toEqual([
    '本格的な角煮の作り方',
    '手軽な角煮の作り方',
  ]);
});
