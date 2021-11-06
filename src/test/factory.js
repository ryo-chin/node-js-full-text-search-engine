const Analyzer = require('../analyzer/analyzer.js');
const Tokenizer = require('../analyzer/tokenizer.js');
const OnMemoryStorage = require('../storage/on-memory-storage');
const UUIDGenerator = require('../indexer/uuid-generator');
const Indexer = require('../indexer/indexer');
const { POSFilter } = require('../analyzer/token-filters');

const buildDefaultAnalyzer = async function buildDefaultAnalyzer() {
  const tokenizer = await Tokenizer.build();
  return new Analyzer(tokenizer, [], [new POSFilter()]);
};

async function buildDefaultIndexer() {
  const analyzer = await buildDefaultAnalyzer();
  const storage = new OnMemoryStorage();
  const idGenerator = new UUIDGenerator();
  return new Indexer(analyzer, storage, idGenerator);
}

exports.buildDefaultAnalyzer = buildDefaultAnalyzer;
exports.buildDefaultIndexer = buildDefaultIndexer;
