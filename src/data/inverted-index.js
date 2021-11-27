//@ts-check

class InvertedIndex {
  /**
   * @param {string} indexId
   * @param {Token} token
   * @param {any[]} [postings]
   */
  constructor(indexId, token, postings) {
    this.indexId = indexId;
    this.token = token;
    this.postings = postings || [];
  }

  /**
   * @param {import("./posting")} posting
   */
  addPosting(posting) {
    this.postings.push(posting);
  }

  /**
   * @param {InvertedIndex} otherIndex
   * @return {InvertedIndex}
   */
  merge(otherIndex) {
    otherIndex.postings.forEach((pos) => this.addPosting(pos));
    return this;
  }
}

module.exports = InvertedIndex;
