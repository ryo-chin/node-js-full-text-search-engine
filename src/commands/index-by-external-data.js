const JSONDataLoader = require('../dump/json-data-loader');
const { buildDefaultIndexer } = require('../config');
const { execAsyncWithPerformance } = require('../util/performance-util');

/**
 * 外部データを利用したインデックスを実行するコマンド
 * - WikipediaのJsonデータをインデックスすることを想定
 * @param {string} inputFilePath 外部データファイルのパス
 * @param {string} outputFilePath インデックスするストレージのパス. 指定がない場合はインメモリの一時ストレージが利用される
 * @param {number} count インデックスする件数
 * @param {number} parallel インデックスの並行処理数
 * }}
 */
async function indexByExternalData({
  inputFilePath,
  outputFilePath,
  count,
  parallel,
}) {
  const [_, time] = await execAsyncWithPerformance(async () => {
    const indexer = await buildDefaultIndexer(outputFilePath);
    const parser = new JSONDataLoader();
    const results = await parser
      .parse(count, inputFilePath)
      .catch((e) => console.error(e));
    console.info(`parsed json data length=${results.length}`);
    for (const [index, res] of results.entries()) {
      await indexer.indexDocument(res.title, res.text);
      console.info(`[${index + 1}] ${res.title}`);
    }
    await indexer.flush(parallel);
  });
  console.info(`index finish (${time.toPrecision(3)}[ms])`);
}

module.exports = indexByExternalData;
