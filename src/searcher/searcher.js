const { toSet } = require('../util/collection-util');

class Searcher {
  constructor(analyzer, storage) {
    this.analyzer = analyzer;
    this.storage = storage;
  }

  search(query) {
    const tokens = this.analyzer.analyze(query);

    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = targetIndexIds
      .map((indexId) => this.storage.loadIndex(indexId))
      .filter((index) => index);
    const documentIds = toSet(
      indexes.flatMap((index) => index.postings.map((p) => p.documentId))
    );
    return documentIds.map((docId) => this.storage.loadDocument(docId));
  }
}

module.exports = Searcher;
