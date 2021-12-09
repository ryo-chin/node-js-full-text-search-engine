//@ts-check

const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
const Document = require('../data/document-data');
const Analyzer = require('../analyzer/analyzer');
const LocalFileStorage = require('../storage/local-file-storage');
const UUIDGenerator = require('./uuid-generator');
const DocumentData = require('../data/document-data');

/**
 * 文書からインデックスを作成するためのclass
 * - analyzerを使って文書をトークンに分割する
 * - storageに文書を保存する
 * - トークンからインデックスを生成し、インメモリバッファ(Map)に保存する
 *   - storageへのインデックスの保存はバッファ内のインデックス数が閾値{@param limit}を超えたとき、または、明示的に{@func flush}を呼び出したとき
 * - バッファの閾値{@param limit}は小さすぎるとIO回数が増えるのでインデックスが遅くなり、大きすぎるとOOMを起こす可能性があるので調整が必要
 */
class Indexer {
  /**
   * コンストラクタ
   * @param {Analyzer} analyzer
   * @param {LocalFileStorage} storage
   * @param {UUIDGenerator} idGenerator
   * @param {number} [limit]
   */
  constructor(analyzer, storage, idGenerator, limit) {
    this.analyzer = analyzer;
    this.storage = storage;
    this.idGenerator = idGenerator;
    /** @type {Map<string, InvertedIndex>} */
    this.tempIndexes = new Map();
    this.limit = limit || 100000;
  }

  /**
   * 文書からインデックスを作成しstorageに保存する
   * - storageに文書を保存する
   * - トークンからインデックスを生成し、インメモリバッファ(Map)に保存する
   *   - storageへのインデックスの保存はバッファ内のインデックス数が閾値{@param limit}を超えたとき、または、明示的に{@func flush}を呼び出したとき
   * @param {string} title
   * @param {string} text
   * @return {Promise<string>} documentId
   */
  async indexDocument(title, text) {
    const documentId = this.idGenerator.generate();
    const tokens = this.analyzer.analyze(text);

    // FIXME: 文書をストレージに保存する
    await this.storage.saveDocument(
      new DocumentData(documentId, title, text, 0)
    );

    // ADVANCED: Tokenの利用回数を集計してインデックス情報に含めてみよう（= PostingのuseCountにTokenの利用回数をsetすればOK）
    const tokenToUseCounts = tokens.reduce((tokens, token) => {
      if (!tokens.get(token.surface)) {
        tokens.set(token.surface, 0);
      }
      tokens.set(token.surface, tokens.get(token.surface) + 1);
      return tokens;
    }, new Map());

    // FIXME: トークンからインデックスを作成しバッファに一時保存する
    // TIPS: バッファ(this.tempIndexes)はMapなので、Map.getやMap.setで値の出し入れができる
    tokens.forEach((token) => {
      if (!this.tempIndexes.get(token.surface)) {
        this.tempIndexes.set(
          token.surface,
          new InvertedIndex(token.surface, [], token)
        );
      }
      // TIPS: インデックス(InvertedIndex)はaddPostingという関数で文書IDを追加することができる
      this.tempIndexes
        .get(token.surface)
        .addPosting(
          new Posting(documentId, tokenToUseCounts.get(token.surface))
        );
    });

    return documentId;
  }

  /**
   * インデックスをstorageに保存する
   */
  async flush() {
    const tempIndexValues = Array.from(this.tempIndexes.values());
    const tempIndexCount = tempIndexValues.length;
    console.info(`flush start tempIndexCount=${tempIndexCount}`);

    // FIXME: バッファから取り出したインデックスをストレージに保存する
    for (const [index, tempIndex] of tempIndexValues.entries()) {
      // FIXME: すでにストレージに保存されているインデックスとマージする
      const savedIndex = await this.storage.loadIndex(tempIndex.indexId);
      await this.storage.saveIndex(
        savedIndex ? savedIndex.merge(tempIndex) : tempIndex
      );
      // ADVANCED: 以下のように標準出力+キャリッジリターン(\r)で実行件数を出力すると、一行でインデックス保存件数の進捗を出力できるので余力があればやってみる.
      //           process.stdout.write(`flush complete ${処理した件数}/${tempIndexCount}\r`);
      //           ループの最後に改行することで後続の出力に上書きされないようにすることも忘れずに
      process.stdout.write(`flush complete ${index}/${tempIndexCount}\r`);
    }
    process.stdout.write(
      `flush complete ${tempIndexCount}/${tempIndexCount}\n`
    );

    // [別解] Promise.allを使った例
    // // FIXME: バッファから取り出したインデックスをストレージに保存する
    // let savedCount = 0;
    // await Promise.all(
    //   tempIndexValues.map(async (tempIndex, index) => {
    //     // FIXME: すでにストレージに保存されているインデックスとマージする
    //     // TIPS: インデックスのマージはInvertedIndex.mergeという関数で行うことができる
    //     // TIPS: 非同期処理(Promise)を配列で処理するときは、 for (const [index, value] of array.entries()) {...} または Promise.all を利用すると良い
    //     const savedIndex = await this.storage.loadIndex(tempIndex.indexId);
    //     await this.storage.saveIndex(
    //       savedIndex ? savedIndex.merge(tempIndex) : tempIndex
    //     );
    //     // ADVANCED: 以下のように標準出力+キャリッジリターン(\r)で実行件数を出力すると、一行でインデックス保存件数の進捗を出力できるので余力があればやってみる.
    //     //           process.stdout.write(`flush complete ${処理した件数}/${tempIndexCount}\r`);
    //     //           ループの最後に改行することで後続の出力に上書きされないようにすることも忘れずに
    //     savedCount++;
    //     process.stdout.write(
    //       `flush complete ${savedCount}/${tempIndexCount}\r`
    //     );
    //   })
    // ).finally(() => process.stdout.write('\n'));

    this.tempIndexes.clear();
  }
}

module.exports = Indexer;
