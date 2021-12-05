//@ts-check

const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
const Document = require('../data/document-data');
const Analyzer = require('../analyzer/analyzer');
const LocalFileStorage = require('../storage/local-file-storage');
const UUIDGenerator = require('./uuid-generator');

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

    // FIXME: トークンからインデックスを作成しバッファに一時保存する

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

    // FIXME: すでにストレージに保存されているインデックスはマージする

    // TIPS: 以下のように標準出力+キャリッジリターン(\r)で実行件数を出力すると、一行でインデックス保存件数の進捗を出力できるので余力があればやってみる.
    //       process.stdout.write(`flush complete ${処理しているインデックス番号}/${tempIndexCount}\r`);
    //       ループの最後に改行することで後続の出力に上書きされないようにすることも忘れずに
    //       process.stdout.write('\n')

    this.tempIndexes.clear();
  }
}

module.exports = Indexer;
