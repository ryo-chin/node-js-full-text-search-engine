//@ts-check

/**
 * 文書のデータclass
 * - 文書のタイトルと本文などの情報を保有する
 * - 含まれているトークン数(tokenCount)などの付加情報も保有する
 */
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
