const Searcher = require('../searcher/searcher');
const { buildDefaultAnalyzer } = require('../config');
const { buildStorage } = require('../config');
const { performance } = require('perf_hooks');
const { ellipsis } = require('../util/string-util');

const newlinePattern = /\r?\n/g;

async function search({ query, indexPath, count }) {
  const analyzer = await buildDefaultAnalyzer();
  const storage = await buildStorage(indexPath);
  const searcher = new Searcher(analyzer, storage);
  const start = performance.now();
  const result = await searcher.search(query, count);
  const time = performance.now() - start;
  outputResult(result, time);
}

function outputResult(result, time) {
  result.docs.forEach((doc) => {
    console.log(`========`);
    console.log(`title: ${ellipsis(doc.title, 100)}`);
    console.log(ellipsis(doc.text.replace(newlinePattern, ''), 100));
  });
  console.log(
    `\n${result.count}件中${result.docs.length}件 (${time.toPrecision(3)}[ms])`
  );
}

module.exports = search;
