const Searcher = require('../searcher/searcher');
const { buildDefaultAnalyzer } = require('../config');
const { buildStorage } = require('../config');
const { performance } = require('perf_hooks');

const newlinePattern = /\r?\n/g;

async function search({ query, indexPath, count }) {
  const analyzer = await buildDefaultAnalyzer();
  const storage = await buildStorage(indexPath);
  const searcher = new Searcher(analyzer, storage);
  const start = performance.now();
  const result = await searcher.search(query);
  const elapsed = performance.now() - start;
  result.slice(0, count).forEach((doc) => {
    console.log(`========`);
    console.log(`title: ${doc.title}`);
    console.log(doc.text.replace(newlinePattern, '').slice(0, 100));
  });
  console.log(`\n${result.length}件 (${elapsed.toPrecision(3)}[ms])`);
}

module.exports = search;
