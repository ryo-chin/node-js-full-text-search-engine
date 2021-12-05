const JSONDataLoader = require('../dump/json-data-loader');
const { buildDefaultIndexer } = require('../config');
const { execAsyncWithPerformance } = require('../util/performance-util');

/**
 * 外部データを利用したインデックスを実行するコマンド
 * - WikipediaのJsonデータをインデックスすることを想定
 * @param {string} inputFilePath 外部データファイルのパス
 * @param {string} storagePath インデックスするストレージのパス. 指定がない場合はインメモリの一時ストレージが利用される
 * @param {number} count インデックスする件数
 * @param {number} parallel インデックスの並行処理数
 * }}
 */
async function indexByExternalData({
  inputFilePath,
  storagePath,
  count,
  parallel,
}) {
  const [_, time] = await execAsyncWithPerformance(async () => {
    const indexer = await buildDefaultIndexer(storagePath);
    const parser = new JSONDataLoader();
    const results = await parser.parse(count, inputFilePath);
    console.log('index document start');
    for (const [index, res] of results.entries()) {
      await indexer.indexDocument(res.title, res.text);
      console.info(`[${index + 1}] ${res.title}`);
    }
    console.log('index document complete');
    await indexer.flush(parallel);
  });
  console.info(`process time=${time.toPrecision(3)}[ms]`);
}

module.exports = indexByExternalData;
