const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
const Document = require('../data/document-data');

class Indexer {
  constructor(analyzer, storage, idGenerator, limit) {
    this.analyzer = analyzer;
    this.storage = storage;
    this.idGenerator = idGenerator;
    this.tempIndexes = new Map();
    this.limit = limit || 1000;
  }

  async addDocument(text) {
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
      this.flush();
    }

    const doc = new Document(documentId, text, tokens.length);
    return this.storage.saveDocument(doc).then(() => documentId);
  }

  async flush() {
    const tempIndexValues = Array.from(this.tempIndexes.values());
    return Promise.all(
      tempIndexValues.map(async (index) => {
        const indexed = await this.storage.loadIndex(index.indexId);
        const mergedIndex = indexed ? indexed.merge(index) : index;
        return await this.storage.saveIndex(mergedIndex);
      })
    ).then(() => (this.tempIndexes = new Map()));
  }
}

module.exports = Indexer;