//@ts-check
const Analyzer = require('../analyzer/analyzer');
const DocumentData = require('../data/document-data');
const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
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
   * - フラグによってトークン利用回数が多いものを先頭に並び替えられる
   * @param {string} query
   * @param {number} limit
   * @param {boolean} andSearch
   * @param {boolean} sortByToken
   * @return {Promise<SearchResult>}
   */
  async search(query, limit = 10, andSearch = false, sortByToken = false) {
    const tokens = this.analyzer.analyze(query);

    // FIXME: 分割したトークンからindexId(token.surface)を取り出し、ストレージからインデックスを取得する
    // TIPS:
    //   - indexIdの重複を排除しておいた方がIOが減るので効率的
    //   - toSet(array) というutil関数を使うとstring配列から重複を排除した配列を取得できる

    // FIXME: 取得したインデックスから文書IDを取り出し、ストレージから文書を取得する. 取得した文書はDocumentResult(matchedTokenUseCountは一旦0でOK)に詰め替えてからSearchResultに詰める
    // TIPS: 事前に文書IDの重複を排除しておかないと同じ文書が複数取れてしまうかも...

    // FIXME: limitで指定された数だけ文書をストレージから取得するようにする

    return new SearchResult([], 0);
    // ADVANCED: andSearch = true のとき、全てのトークンを含んでいる文書のみ検索にヒットするようにしてみよう
    // TIPS: 取得できたIndexごとに含まれる文書IDの積集合を取ると全てのトークンを含んでいる文書IDが特定できるよ

    // ADVANCED: sortByToken = true のとき、トークンの利用回数が多い文書を先頭に並び替えてみよう
    // TIPS:
    //   - まずは文書ごとのトークン利用回数を集計して key: 文書ID, value: keyの文書に登場したトークン利用回数の合計値 というMapを作ってみよう
    //   - Array.from({トークン利用回数を集計したMap}.entries()) とすると [文書ID, トークン利用回数の合計値][] という二次元配列ができるのでsortすることができるよ
  }
}

/**
 * 検索結果を保持するclass
 */
class SearchResult {
  /**
   * @param {DocumentResult[]} docs
   * @param {number} totalCount
   */
  constructor(docs, totalCount) {
    /** @type {DocumentResult[]} ヒットした文書 */
    this.docs = docs;
    /** @type {number} 総ヒット件数 */
    this.totalCount = totalCount;
  }
}

/**
 * 検索結果用の文書情報を保持するclass
 */
class DocumentResult {
  /**
   * @param {DocumentData} doc
   * @param {number} matchedTokenUseCount ヒットしたトークンの合計利用回数
   */
  constructor(doc, matchedTokenUseCount = 0) {
    this.doc = doc;
    this.matchedTokenUseCount = matchedTokenUseCount;
  }

  get title() {
    return this.doc.title;
  }

  get text() {
    return this.doc.text;
  }
}

module.exports = Searcher;
