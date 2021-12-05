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
   * @param {number} limit
   * @return {Promise<SearchResult>}
   */
  async search(query, limit = 10) {
    const tokens = this.analyzer.analyze(query);

    // FIXME: 分割したトークンからsurface取り出し、ストレージからインデックスを取得する. surfaceの重複を排除しておいた方がIOが減るので効率的.
    // TIPS: toSet(array) というutil関数を使うとstring配列から重複を排除した配列を取得できる

    // FIXME: 取得したインデックスから文書IDを取り出し、ストレージから文書を取得する. 事前に文書IDの重複を排除しておかないと同じ文書が複数取れてしまうかも...
    // FIXME: 取得した文書をSearchResultに詰める
    // FIXME: limitで指定された数だけ文書をストレージから取得するようにする

    return new SearchResult([], 0);
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
