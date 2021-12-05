//@ts-check

/**
 * ポスティング（インデックスに保有する文書情報）のデータclass
 * - インデックスに持たせることを前提としており、ポスティングの文書IDによって key: トークン, value: 文書ID というインデックス構造を成立させる
 * - 文書ごとの当該トークン利用数(useCount)などの付加情報を保有しており、ソートなどに利用される
 */
class Posting {
  /**
   * @param {string} documentId 文書ID
   * @param {number} useCount 当該トークンが利用されている回数
   */
  constructor(documentId, useCount = 0) {
    this.documentId = documentId;
    this.useCount = useCount;
  }
}

module.exports = Posting;
