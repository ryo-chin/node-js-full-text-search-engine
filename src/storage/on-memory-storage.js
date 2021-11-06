class OnMemoryStorage {
  constructor() {
    this.documents = new Map();
    this.indexies = new Map();
  }

  saveDocument(documentId, document) {
    this.documents.set(documentId, document);
  }

  saveIndex(invertedIndex) {
    this.indexies.set(invertedIndex.indexId, invertedIndex);
  }

  loadDocument(documentId) {
    return this.documents.get(documentId);
  }

  loadIndex(indexId) {
    return this.indexies.get(indexId);
  }
}

module.exports = OnMemoryStorage;
