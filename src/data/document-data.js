class DocumentData {
  constructor(documentId, title, text, tokenCount) {
    this.documentId = documentId;
    this.title = title;
    this.text = text;
    this.tokenCount = tokenCount;
  }
}

module.exports = DocumentData;
