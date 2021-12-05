//@ts-check
const Analyzer = require('../analyzer/analyzer');
const DocumentData = require('../data/document-data');
const LocalFileStorage = require('../storage/local-file-storage');
const { toSet } = require('../util/collection-util');

/**
 * インデックスを用いて、文書を検索するclass
 */
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
   * 文書を検索する
   * - クエリ{@param query}を{@param analyze}によってトークンに分割
   * - トークンを用いてインデックスを取得
   * - インデックスに含まれる文書IDから文書を取得
   * @param {string} query
   * @param {number | undefined} limit
   * @return {Promise<SearchResult>}
   */
  async search(query, limit) {
    const tokens = this.analyzer.analyze(query);
    // トークンの重複を排除して、インデックスを取得
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    // 文書IDの重複を排除して文書を取得
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

/**
 * 検索結果を保持するclass
 */
class SearchResult {
  /**
   * @param {DocumentData[]} docs
   * @param {number} count
   */
  constructor(docs, count) {
    /** @type {DocumentData[]} ヒットした文書 */
    this.docs = docs;
    /** @type {number} 総ヒット件数 */
    this.count = count;
  }
}

module.exports = Searcher;
