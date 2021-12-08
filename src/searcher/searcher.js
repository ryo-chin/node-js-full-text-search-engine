//@ts-check
const Analyzer = require('../analyzer/analyzer');
const DocumentData = require('../data/document-data');
const InvertedIndex = require('../data/inverted-index');
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
   * - トークンを用いてインデックスを取得
   * - インデックスに含まれる文書IDから文書を取得
   * - フラグによってAND検索 OR検索を切り替えられる
   * @param {string} query
   * @param {number} limit
   * @param {boolean} andSearch
   * @return {Promise<SearchResult>}
   */
  async search(query, limit = 10, andSearch = false) {
    const tokens = this.analyzer.analyze(query);
    // トークンの重複を排除して、インデックスを取得
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    // 文書IDの重複を排除して文書を取得
    const documentIds = this.extractDocumentIds(indexes, andSearch);
    const searchIds = documentIds.slice(0, limit || 10);
    return this.storage
      .loadDocuments(searchIds)
      .then((docs) => new SearchResult(docs, documentIds.length));
  }

  /**
   * インデックスの配列から検索対象の文書IDを抽出する
   * - フラグで AND検索(積集合を取る) または OR検索(和集合を取る) を指定できる
   *
   * @param {InvertedIndex[]} indexes
   * @param {boolean} andSearch true: AND検索, false: OR検索
   * @return {string[]}
   */
  extractDocumentIds(indexes, andSearch) {
    return andSearch
      ? indexes
          .filter((index) => index)
          .map((index) => index.postings)
          .reduce((prevValues, nextValues) => {
            if (prevValues.length === 0) {
              return [];
            }
            return nextValues.filter((nv) =>
              prevValues.map((pv) => pv.documentId).includes(nv.documentId)
            );
          })
          .map((pos) => pos.documentId)
      : toSet(
          indexes
            .filter((index) => index)
            .flatMap((index) => index.postings.map((p) => p.documentId))
        );
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
