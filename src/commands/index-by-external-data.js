const PerformanceLogger = require('../util/performance-logger');
const JSONDataLoader = require('../dump/json-data-loader');
const { buildDefaultIndexer } = require('../config');

async function indexByExternalData({
  inputFilePath,
  outputFilePath,
  count,
  parallel,
}) {
  const performanceLogger = new PerformanceLogger();
  const indexer = await buildDefaultIndexer(outputFilePath);
  const parser = new JSONDataLoader();
  const results = await parser.parse(count, inputFilePath);
  for (const [index, res] of results.entries()) {
    await indexer.addDocument(res.title, res.text);
    console.info(`[${index + 1}] ${res.title}`);
  }
  await indexer.flush(parallel);
  performanceLogger.end('index finish');
}

module.exports = indexByExternalData;
