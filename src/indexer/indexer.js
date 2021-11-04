class Indexer {
  constructor(analyzer, storage, idGenerator, limit) {
    this.analyzer = analyzer;
    this.storage = storage;
    this.idGenerator = idGenerator;
    this.tempIndexes = new Map();
    this.limit = limit || 1000;
  }

  addDocument(text) {
    const documentId = this.idGenerator.generate();
    const tokens = this.analyzer.analyze(text);
    this.storage.saveDocument(documentId, {
      documentId,
      text,
      tokenCount: tokens.length,
    });

    const tokenWithUseCounts = tokens.reduce((tokens, token) => {
      if (!tokens.get(token.surface)) {
        tokens.set(token.surface, { ...token, useCount: 0 });
      }
      ++tokens.get(token.surface).useCount;
      return tokens;
    }, new Map());
    tokenWithUseCounts.forEach((token) => {
      if (!this.tempIndexes.get(token.surface)) {
        this.tempIndexes.set(token.surface, new InvertedIndex(token));
      }
      const posting = new Posting(documentId, token.useCount);
      this.tempIndexes.get(token.surface).addPosting(posting);
    });

    if (this.tempIndexes.size > this.limit) {
      this.flush();
    }

    return documentId;
  }

  flush() {
    this.tempIndexes.forEach((index) => {
      const indexed = this.storage.loadIndex(index.indexId);
      const mergedIndex = indexed ? indexed.merge(index) : index;
      this.storage.saveIndex(mergedIndex);
    });
    this.tempIndexes = new Map();
  }
}

class InvertedIndex {
  constructor(token) {
    this.indexId = token.surface;
    this.token = {
      surface: token.surface,
      pos: token.pos,
    };
    this.postings = [];
  }

  addPosting(posting) {
    this.postings.push(posting);
  }

  merge(otherIndex) {
    otherIndex.postings.forEach((pos) => this.addPosting(pos));
    return this;
  }
}

class Posting {
  constructor(documentId, useCount) {
    this.documentId = documentId;
    this.useCount = useCount;
  }
}

module.exports = Indexer;
