//@ts-check
const { toSet } = require('../util/collection-util');

class Searcher {
  /**
   * @param {import("../analyzer/analyzer")} analyzer
   * @param {import("../storage/local-file-storage")} storage
   */
  constructor(analyzer, storage) {
    this.analyzer = analyzer;
    this.storage = storage;
  }

  /**
   * @param {string} query
   * @return {Promise<import("../data/document-data")[]>}
   */
  async search(query) {
    const tokens = this.analyzer.analyze(query);
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    const documentIds = toSet(
      indexes
        .filter((index) => index)
        .flatMap((index) => index.postings.map((p) => p.documentId))
    );
    return this.storage.loadDocuments(documentIds);
  }
}

module.exports = Searcher;
