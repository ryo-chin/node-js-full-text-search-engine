const LocalFileStorage = require('./local-file-storage');
const DocumentData = require('../data/document-data');
const InvertedIndex = require('../data/inverted-index');

test('local-file-storage', async () => {
  const storage = await LocalFileStorage.build();
  const documentId = 'yyyy';
  const text = '本文';
  const inputDocument = new DocumentData(documentId, text, 1);
  await storage.saveDocuments([inputDocument]);
  const inputIndex = new InvertedIndex(text, { surface: text, pos: '名詞' });
  await storage.saveIndexes([inputIndex]);

  const doc = await storage.loadDocuments([documentId]);
  const index = await storage.loadIndexes([inputIndex.indexId]);
  expect(doc).toEqual([inputDocument]);
  expect(index).toEqual([inputIndex]);

  await storage.shutdown();
});
