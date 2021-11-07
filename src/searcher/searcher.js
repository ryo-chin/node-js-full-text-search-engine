const { toSet } = require('../util/collection-util');

class Searcher {
  constructor(analyzer, storage) {
    this.analyzer = analyzer;
    this.storage = storage;
  }

  async search(query) {
    const tokens = this.analyzer.analyze(query);
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    const documentIds = toSet(
      indexes.flatMap((index) => index.postings.map((p) => p.documentId))
    );
    return this.storage.loadDocuments(documentIds);
  }
}

module.exports = Searcher;
