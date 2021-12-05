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

    // tokenの重複を取り除きつつ、各tokenの出現回数を算出する
    const tokenWithUseCounts = tokens.reduce((tokens, token) => {
      if (!tokens.get(token.surface)) {
        tokens.set(token.surface, { ...token, useCount: 0 });
      }
      ++tokens.get(token.surface).useCount;
      return tokens;
    }, new Map());

    // tokenからインデックスを作成し、インメモリバッファに保存する
    tokenWithUseCounts.forEach((token) => {
      if (!this.tempIndexes.get(token.surface)) {
        this.tempIndexes.set(
          token.surface,
          new InvertedIndex(token.surface, [], token)
        );
      }
      // インデックスに対して文書情報（Posting）をListで持たせる
      const posting = new Posting(documentId, token.useCount);
      this.tempIndexes.get(token.surface).addPosting(posting);
    });

    // バッファ内のインデックス数が閾値を超えていたらstorageへ保存（flush）する
    if (this.tempIndexes.size > this.limit) {
      await this.flush();
    }

    // 文書の保存に成功したら文書IDを返す
    const doc = new Document(documentId, title, text, tokens.length);
    return this.storage.saveDocument(doc).then(() => documentId);
  }

  /**
   * インデックスをstorageに保存する
   * - 指定された並行数(parallelCount)でインデックスの保存を行う
   * - sqlite3をstorageに使っている場合、insertが並列処理に対応してないようなのであまり意味はない...
   * @param {number} [parallelCount]
   */
  async flush(parallelCount) {
    const tempIndexValues = Array.from(this.tempIndexes.values());
    let cursor = 0;
    const workers = [];
    const parallel = parallelCount || 1;
    const tempIndexCount = tempIndexValues.length;
    console.info(
      `flush start tempIndexCount=${tempIndexCount}, parallel=${parallel}`
    );

    // 指定された並行数分worker(Promise)を用意する
    for (let i = 0; i < parallel; i++) {
      const worker = new Promise(async (resolve) => {
        // 処理中のインデックスを示すcursorをincrementしながらインデックスを保存していく
        while (cursor < tempIndexCount) {
          const tempIndex = tempIndexValues[cursor];
          // 対象データを取り出したら非同期処理を始める前にcursorをincrementしておく.
          // JavaScriptはシングルスレッドで実行されるので非同期処理を始める前にincrementすることでスレッドセーフにcursorをincrementできる(cursor++をawaitの後に移動してみるとログ出力してみると挙動がよくわかる)
          cursor++;

          // 既存のインデックスがあればマージしたうえで保存する
          const indexed = await this.storage.loadIndex(tempIndex.indexId);
          const mergedIndex = indexed ? indexed.merge(tempIndex) : tempIndex;
          await this.storage.saveIndex(mergedIndex);

          // 進捗を出力(標準出力+キャリッジリターンで1行に進捗を出力するようにし、ループの最後に改行を出力)
          const progress =
            cursor < tempIndexCount
              ? `flush complete ${cursor}/${tempIndexCount}\r`
              : '\n';
          process.stdout.write(progress);
        }
        resolve();
      });
      workers.push(worker);
    }

    // Promise.allで全ての並行処理が完了するのを待つ
    await Promise.all(workers);

    // バッファをクリアする
    this.tempIndexes.clear();
    console.info('flush end');
  }
}

module.exports = Indexer;
