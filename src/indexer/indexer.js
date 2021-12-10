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
    /** @type {InvertedIndex[]} */
    this.tempIndexes = [];
    this.limit = limit || 100000;
  }

  /**
   * 文書からインデックスを作成しstorageに保存する
   * - storageに文書を保存する
   * - トークンからインデックスを生成し、インメモリバッファ(Map)に保存する
   *   - すぐに保存をしないのはインデックスへの書き込みを一定量バッファに溜めることでIOの回数を減らすことができるから
   *   - storageへのインデックスの保存はバッファ内のインデックス数が閾値{@param limit}を超えたとき、または、明示的に{@func flush}を呼び出したときに行う
   * @param {string} title
   * @param {string} text
   * @return {Promise<string>} documentId
   */
  async indexDocument(title, text) {
    const documentId = this.idGenerator.generate();
    const tokens = this.analyzer.analyze(text);

    // FIXME: 文書をストレージに保存する
    // TIPS: storageへの保存にはsaveDocumentという関数が使える
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
    // TIPS:
    //   - トークンからインデックス(InvertedIndex)を作成する際は以下を留意
    //     - indexIdはトークン(=token.surface)を利用する
    //     - 文書IDはPostingという形式で配列に入れて保存する
    //       - addPostingという関数で追加することができる
    //       - PostingのuseCountは一旦0のままで良い
    //   - バッファ(this.tempIndexes)には key: token.surface, value: InvertedIndex という形式で保存する
    //     - バッファはMapなので、Map.getやMap.setで値の出し入れができる
    tokens.forEach((token) => {
      let posting = new Posting(
        documentId,
        tokenToUseCounts.get(token.surface)
      );
      this.tempIndexes.push(new InvertedIndex(token.surface, [posting], token));
    });

    // MORE: (flushの実装完了後)バッファ内の一時インデックスが閾値(this.limit)を超えたときflushしよう
    if (this.tempIndexes.length > this.limit) {
      await this.flush();
    }

    return documentId;
  }

  /**
   * インデックスをstorageに保存する
   */
  async flush() {
    const tempIndexValues = this.tempIndexes;
    const tempIndexCount = tempIndexValues.length;
    console.info(`flush start tempIndexCount=${tempIndexCount}`);

    // FIXME: バッファから取り出したインデックスをストレージに保存する
    // TIPS: storageへの保存にはsaveIndexという関数が使える
    for (const [index, tempIndex] of tempIndexValues.entries()) {
      // FIXME: すでにストレージに保存されているインデックスとマージする
      // TIPS:
      //   - インデックスのマージはInvertedIndex.mergeという関数で行うことができる
      //   - 非同期処理(Promise)を配列で処理するときは、 for (const [index, value] of array.entries()) {...} または Promise.all を利用すると良い
      const savedIndex = await this.storage.loadIndex(tempIndex.indexId);
      await this.storage.saveIndex(
        savedIndex ? savedIndex.merge(tempIndex) : tempIndex
      );
      // MORE:
      //   - 以下のように標準出力+キャリッジリターン(\r)で実行件数を出力すると、一行でインデックス保存件数の進捗を出力できるので余力があればやってみる.
      //   - process.stdout.write(`flush complete ${処理した件数}/${tempIndexCount}\r`);
      //   - ループの最後に改行することで後続の出力に上書きされないようにすることも忘れずに
      process.stdout.write(`flush complete ${index}/${tempIndexCount}\r`);
    }
    process.stdout.write(
      `flush complete ${tempIndexCount}/${tempIndexCount}\n`
    );

    // [別解] Promise.allを使った例
    // FIXME: バッファから取り出したインデックスをストレージに保存する
    // TIPS: storageへの保存にはsaveIndexという関数が使える
    // const summarizedIndexes = tempIndexValues.reduce((indexes, index) => {
    //   if (!indexes.get(index.indexId)) {
    //     indexes.set(index.indexId, index);
    //   } else {
    //     indexes.get(index.indexId).merge(index);
    //   }
    //   return indexes;
    // }, new Map());
    // let savedCount = 0;
    // await Promise.all(
    //   Array.from(summarizedIndexes.values()).map(async (tempIndex) => {
    //     // FIXME: すでにストレージに保存されているインデックスとマージする
    //     // TIPS:
    //     //   - インデックスのマージはInvertedIndex.mergeという関数で行うことができる
    //     //   - 非同期処理(Promise)を配列で処理するときは、 for (const [index, value] of array.entries()) {...} または Promise.all を利用すると良い
    //     const savedIndex = await this.storage.loadIndex(tempIndex.indexId);
    //     await this.storage.saveIndex(
    //       savedIndex ? savedIndex.merge(tempIndex) : tempIndex
    //     );
    //     // MORE:
    //     //   - 以下のように標準出力+キャリッジリターン(\r)で実行件数を出力すると、一行でインデックス保存件数の進捗を出力できるので余力があればやってみる.
    //     //   - process.stdout.write(`flush complete ${処理した件数}/${tempIndexCount}\r`);
    //     //   - ループの最後に改行することで後続の出力に上書きされないようにすることも忘れずに
    //     savedCount++;
    //     process.stdout.write(
    //       `flush complete ${savedCount}/${tempIndexCount}\r`
    //     );
    //   })
    // ).finally(() => process.stdout.write('\n'));

    this.tempIndexes = [];
  }
}

module.exports = Indexer;
