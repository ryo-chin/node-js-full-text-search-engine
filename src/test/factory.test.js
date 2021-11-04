const Analyzer = require('../analyzer/analyzer.js');
const Tokenizer = require('../analyzer/tokenizer.js');
const { POSFilter } = require('../analyzer/token-filters');

const buildDefaultAnalyzer = async function buildDefaultAnalyzer() {
  const tokenizer = await Tokenizer.build();
  return new Analyzer(tokenizer, [], [new POSFilter()]);
};

exports.buildDefaultAnalyzer = buildDefaultAnalyzer;
