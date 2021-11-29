//@ts-check
const Analyzer = require('../analyzer/analyzer');
const DocumentData = require('../data/document-data');
const LocalFileStorage = require('../storage/local-file-storage');
const { toSet } = require('../util/collection-util');

class Searcher {
  /**
   * @param {Analyzer} analyzer
   * @param {LocalFileStorage} storage
   */
  constructor(analyzer, storage) {
    this.analyzer = analyzer;
    this.storage = storage;
  }

  /**
   * @param {string} query
   * @param {number | undefined} limit
   * @return {Promise<SearchResult>}
   */
  async search(query, limit) {
    const tokens = this.analyzer.analyze(query);
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    const documentIds = toSet(
      indexes
        .filter((index) => index)
        .flatMap((index) => index.postings.map((p) => p.documentId))
    );
    const searchIds = documentIds.slice(0, limit || 10);
    return this.storage
      .loadDocuments(searchIds)
      .then((docs) => new SearchResult(docs, documentIds.length));
  }
}

class SearchResult {
  /**
   * @param {DocumentData[]} docs
   * @param {number} count
   */
  constructor(docs, count) {
    /** @type {DocumentData[]} */
    this.docs = docs;
    /** @type {number} */
    this.count = count;
  }
}

module.exports = Searcher;
