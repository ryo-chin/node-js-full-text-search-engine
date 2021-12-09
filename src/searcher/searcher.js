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

    // FIXME: 分割したトークンからsurface取り出し、ストレージからインデックスを取得する. surfaceの重複を排除しておいた方がIOが減るので効率的.
    // TIPS:
    //   - indexIdの重複を排除しておいた方がIOが減るので効率的
    //   - toSet(array) というutil関数を使うとstring配列から重複を排除した配列を取得できる
    const indexes = await this.storage.loadIndexes(
      toSet(tokens.map((token) => token.surface))
    );

    // ADVANCED: andSearch = true のとき、全てのトークンを含んでいる文書のみ検索にヒットするようにしてみよう
    // TIPS: 取得できたIndexごとに含まれる文書IDの積集合を取ると全てのトークンを含んでいる文書IDが特定できるよ
    const postings = this.extractPostings(indexes, andSearch);

    // ADVANCED: sortByToken = true のとき、トークンの利用回数が多い文書を先頭に並び替えてみよう
    // TIPS:
    //   - まずは文書ごとのトークン利用回数を集計して key: 文書ID, value: keyの文書に登場したトークン利用回数の合計値 というMapを作ってみよう
    //   - Array.from({トークン利用回数を集計したMap}.entries()) とすると [文書ID, トークン利用回数の合計値][] という二次元配列ができるのでsortすることができるよ    const docToTokenCounts = this.calculateTokenUseCount(postings);
    const docToTokenCounts = this.calculateTokenUseCount(postings);
    // FIXME: 取得したインデックスから文書IDを取り出し、ストレージから文書を取得する. 取得した文書はDocumentResult(matchedTokenUseCountは一旦0でOK)に詰め替えてからSearchResultに詰める
    // TIPS: 事前に文書IDの重複を排除しておかないと同じ文書が複数取れてしまうかも...
    const documentIds = sortByToken
      ? this.sortByTokenUseCount(docToTokenCounts)
      : toSet(postings.map((p) => p.documentId));

    // FIXME: limitで指定された数だけ文書をストレージから取得するようにする
    // FIXME: 取得した文書をSearchResultに詰める
    return this.storage
      .loadDocuments(documentIds.slice(0, limit || 10))
      .then((docs) => {
        const docs1 = docs.map(
          (doc) => new DocumentResult(doc, docToTokenCounts.get(doc.documentId))
        );
        return new SearchResult(docs1, documentIds.length);
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
   *
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
   * @param {number} count
   */
  constructor(docs, count) {
    /** @type {DocumentResult[]} ヒットした文書 */
    this.docs = docs;
    /** @type {number} 総ヒット件数 */
    this.count = count;
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
