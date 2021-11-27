//@ts-check

class DocumentData {
  /**
   * @param {string} documentId
   * @param {string} title
   * @param {string} text
   * @param {number} tokenCount
   */
  constructor(documentId, title, text, tokenCount) {
    this.documentId = documentId;
    this.title = title;
    this.text = text;
    this.tokenCount = tokenCount;
  }
}

module.exports = DocumentData;
