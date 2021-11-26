const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
const Document = require('../data/document-data');

class Indexer {
  constructor(analyzer, storage, idGenerator, limit) {
    this.analyzer = analyzer;
    this.storage = storage;
    this.idGenerator = idGenerator;
    this.tempIndexes = new Map();
    this.limit = limit || 100000;
  }

  async addDocument(title, text) {
    const documentId = this.idGenerator.generate();
    const tokens = this.analyzer.analyze(text);
    const tokenWithUseCounts = tokens.reduce((tokens, token) => {
      if (!tokens.get(token.surface)) {
        tokens.set(token.surface, { ...token, useCount: 0 });
      }
      ++tokens.get(token.surface).useCount;
      return tokens;
    }, new Map());
    tokenWithUseCounts.forEach((token) => {
      if (!this.tempIndexes.get(token.surface)) {
        this.tempIndexes.set(
          token.surface,
          new InvertedIndex(token.surface, token)
        );
      }
      const posting = new Posting(documentId, token.useCount);
      this.tempIndexes.get(token.surface).addPosting(posting);
    });

    if (this.tempIndexes.size > this.limit) {
      await this.flush();
    }

    const doc = new Document(documentId, title, text, tokens.length);
    return this.storage.saveDocument(doc).then(() => documentId);
  }

  async flush(parallelCount) {
    const tempIndexValues = Array.from(this.tempIndexes.values());
    let cursor = 0;
    const workers = [];
    const parallel = parallelCount || 1;
    console.info(
      `flush start tempIndexCount=${tempIndexValues.length}, parallel=${parallel}`
    );
    for (let i = 0; i < parallel; i++) {
      const worker = new Promise(async (resolve) => {
        while (cursor < tempIndexValues.length) {
          const tempIndex = tempIndexValues[cursor];
          cursor++;
          const indexed = await this.storage.loadIndex(tempIndex.indexId);
          const mergedIndex = indexed ? indexed.merge(tempIndex) : tempIndex;
          await this.storage.saveIndex(mergedIndex);
        }
        resolve();
      });
      workers.push(worker);
    }

    await Promise.all(workers);

    this.tempIndexes.clear();
    console.info('flush end');
  }
}

module.exports = Indexer;
