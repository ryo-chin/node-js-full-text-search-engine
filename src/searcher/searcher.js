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
    // トークンの重複を排除して、インデックスを取得
    const targetIndexIds = toSet(tokens.map((token) => token.surface));
    const indexes = await this.storage.loadIndexes(targetIndexIds);
    // 検索条件に合わせてポスティングを抽出
    const postings = this.extractPostings(indexes, andSearch);
    // 文書IDごとにトークン利用回数の合計値を計算する
    const docToTokenCounts = this.calculateTokenUseCount(postings);
    // ソートの要否に合わせて文書IDを抽出
    const documentIds = sortByToken
      ? this.sortByTokenUseCount(docToTokenCounts)
      : toSet(postings.map((p) => p.documentId));
    return this.storage
      .loadDocuments(documentIds.slice(0, limit || 10))
      .then((docs) => {
        return new SearchResult(
          docs.map(
            (doc) =>
              new DocumentResult(doc, docToTokenCounts.get(doc.documentId))
          ),
          documentIds.length
        );
      });
  }

  /**
   * インデックスの配列から検索対象のポスティングを抽出する
   * - フラグで AND検索(積集合を取る) または OR検索(和集合を取る) を指定できる
   *
   * @param {InvertedIndex[]} indexes
   * @param {boolean} andSearch true: AND検索, false: OR検索
   * @return {Posting[]}
   */
  extractPostings(indexes, andSearch) {
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
      : indexes.filter((index) => index).flatMap((index) => index.postings);
  }

  /**
   * トークンの利用回数をもとに並び替え
   * @param {Map<string, number>} docToUseCounts
   * @return {string[]}
   */
  sortByTokenUseCount(docToUseCounts) {
    return (
      Array.from(docToUseCounts.entries())
        // 利用数の降順に並び替え
        .sort(([_, prevUseCount], [__, nextUseCount]) => {
          return nextUseCount - prevUseCount;
        })
        .map(([docId, _]) => docId)
    );
  }

  /**
   * 文書IDごとにトークンの利用回数の合計値を計算する
   *
   * @param postings
   * @return {Map<string, number>} key: 文書ID, value: トークン利用回数の合計数
   */
  calculateTokenUseCount(postings) {
    return postings.reduce((calculated, posting) => {
      if (!calculated.get(posting.documentId)) {
        calculated.set(posting.documentId, 0);
      }
      calculated.set(
        posting.documentId,
        calculated.get(posting.documentId) + posting.useCount
      );
      return calculated;
    }, new Map());
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
  constructor(doc, matchedTokenUseCount) {
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
