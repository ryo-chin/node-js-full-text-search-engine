const Searcher = require('../searcher/searcher');
const { buildDefaultAnalyzer } = require('../config');
const { buildStorage } = require('../config');
const { ellipsis } = require('../util/string-util');
const { execAsyncWithPerformance } = require('../util/performance-util');

const newlinePattern = /\r?\n/g;

/**
 * インデックスを用いた文書検索を実行するコマンド
 * @param {string} query 検索クエリ
 * @param {string} storagePath 検索対象のストレージのファイルパス
 * @param {number} count 取得する文書の件数
 * @param {boolean} andSearch AND検索 または OR検索をするか
 */
async function searchDocuments({ query, storagePath, count, andSearch }) {
  const analyzer = await buildDefaultAnalyzer();
  const storage = await buildStorage(storagePath);
  const searcher = new Searcher(analyzer, storage);
  const [result, time] = await execAsyncWithPerformance(
    async () => await searcher.search(query, count, andSearch)
  );
  outputResult(result, time);
}

function outputResult(result, time, andSearch) {
  result.docs.forEach((doc) => {
    console.info(`========`);
    console.info(`title: ${ellipsis(doc.title, 100)}`);
    console.info(ellipsis(doc.text.replace(newlinePattern, ''), 100));
  });
  console.info(
    `\n${result.count}件中${result.docs.length}件 (${time.toPrecision(
      3
    )}[ms]) by ${andSearch ? 'AND検索' : 'OR検索'}`
  );
}

module.exports = searchDocuments;
