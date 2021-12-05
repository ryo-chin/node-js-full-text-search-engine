const JSONDataLoader = require('../dump/json-data-loader');
const { buildDefaultIndexer } = require('../config');
const { performance } = require('perf_hooks');

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
  const start = performance.now();

  const indexer = await buildDefaultIndexer(outputFilePath);
  const parser = new JSONDataLoader();
  const results = await parser
    .parse(count, inputFilePath)
    .catch((e) => console.error(e));
  console.info(`parsed json data length=${results.length}`);
  for (const [index, res] of results.entries()) {
    await indexer.addDocument(res.title, res.text);
    console.info(`[${index + 1}] ${res.title}`);
  }
  await indexer.flush(parallel);

  const time = performance.now() - start;
  console.info(`index finish (${time.toPrecision(3)}[ms])`);
}

module.exports = indexByExternalData;
