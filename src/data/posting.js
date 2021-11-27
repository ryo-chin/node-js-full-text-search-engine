//@ts-check

class Posting {
  /**
   * @param {string} documentId
   * @param {number} useCount
   */
  constructor(documentId, useCount) {
    this.documentId = documentId;
    this.useCount = useCount;
  }
}

module.exports = Posting;
