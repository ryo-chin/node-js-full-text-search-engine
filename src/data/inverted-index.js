//@ts-check

const Posting = require('./posting');

/**
 * 転置インデックスのデータclass
 * - indexIdはトークンの表層系(surface)を用いる
 * - 当該トークンを含んでいた文書情報をポスティングリスト(postings)として保有する
 * - トークン自体の情報も保有する
 */
class InvertedIndex {
  /**
   * @param {string} indexId トークンの表層形(Token.surface)
   * @param {Posting[]} postings
   * @param {Token} token
   */
  constructor(indexId, postings, token) {
    this.indexId = indexId;
    this.postings = postings;
    this.token = token;
  }

  /**
   * ポスティングを追加する
   * @param {Posting} posting
   */
  addPosting(posting) {
    this.postings.push(posting);
  }

  /**
   * インデックスをマージする
   * @param {InvertedIndex} otherIndex
   * @return {InvertedIndex} ポスティングリストの情報をマージしたインデックス
   */
  merge(otherIndex) {
    otherIndex.postings.forEach((pos) => this.addPosting(pos));
    return this;
  }
}

module.exports = InvertedIndex;
