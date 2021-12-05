const Analyzer = require('../analyzer/analyzer.js');
const Tokenizer = require('../analyzer/tokenizer.js');
const UUIDGenerator = require('../indexer/uuid-generator');
const Indexer = require('../indexer/indexer');
const LocalFileStorage = require('../storage/local-file-storage');
const { POSFilter } = require('../analyzer/token-filters');
const { SymbolFilter } = require('../analyzer/char-filters');
const { v4: uuid } = require('uuid');
const fs = require('fs-extra');

/**
 * 標準的なAnalyzerを構築するためのfactory
 * @returns {Promise<Analyzer>}
 */
async function buildDefaultAnalyzer() {
  const tokenizer = await Tokenizer.build();
  return new Analyzer(tokenizer, [new SymbolFilter()], [new POSFilter()]);
}

/**
 * Storageを構築するためのfactory
 * @returns {Promise<LocalFileStorage>}
 */
async function buildStorage(customStoragePath) {
  const storagePath = customStoragePath || `./tmp/${uuid()}.sqlite`;
  fs.ensureFileSync(storagePath);
  return await LocalFileStorage.build(storagePath);
}

/**
 * 標準的なIndexerを構築するためのfactory
 * @param {string | null} customStoragePath
 * @returns {Promise<Indexer>}
 */
async function buildDefaultIndexer(customStoragePath = null) {
  const analyzer = await buildDefaultAnalyzer();
  const storage = await buildStorage(customStoragePath);
  const idGenerator = new UUIDGenerator();
  return new Indexer(analyzer, storage, idGenerator);
}

exports.buildDefaultAnalyzer = buildDefaultAnalyzer;
exports.buildStorage = buildStorage;
exports.buildDefaultIndexer = buildDefaultIndexer;
