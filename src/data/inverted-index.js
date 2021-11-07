class InvertedIndex {
  constructor(indexId, token, postings) {
    this.indexId = indexId;
    this.token = token;
    this.postings = postings || [];
  }

  addPosting(posting) {
    this.postings.push(posting);
  }

  merge(otherIndex) {
    otherIndex.postings.forEach((pos) => this.addPosting(pos));
    return this;
  }
}

module.exports = InvertedIndex;
