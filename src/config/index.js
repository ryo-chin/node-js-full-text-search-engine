const Analyzer = require('../analyzer/analyzer.js');
const Tokenizer = require('../analyzer/tokenizer.js');
const UUIDGenerator = require('../indexer/uuid-generator');
const Indexer = require('../indexer/indexer');
const LocalFileStorage = require('../storage/local-file-storage');
const { POSFilter } = require('../analyzer/token-filters');
const { SymbolFilter } = require('../analyzer/char-filters');
const { v4: uuid } = require('uuid');
const fs = require('fs-extra');

async function buildDefaultAnalyzer() {
  const tokenizer = await Tokenizer.build();
  return new Analyzer(tokenizer, [new SymbolFilter()], [new POSFilter()]);
}

async function buildStorage(customStoragePath) {
  const storagePath = customStoragePath || `./tmp/${uuid()}.sqlite`;
  fs.ensureFileSync(storagePath);
  return await LocalFileStorage.build(storagePath);
}

async function buildDefaultIndexer(customStoragePath) {
  const analyzer = await buildDefaultAnalyzer();
  const storage = await buildStorage(customStoragePath);
  const idGenerator = new UUIDGenerator();
  return new Indexer(analyzer, storage, idGenerator);
}

exports.buildDefaultAnalyzer = buildDefaultAnalyzer;
exports.buildStorage = buildStorage;
exports.buildDefaultIndexer = buildDefaultIndexer;
