//@ts-check

const { CharFilter } = require('./char-filters');
const { TokenFilter } = require('./token-filters');
const { Tokenizer } = require('./tokenizer');

/**
 * 文書をトークン化するためのAnalyzer
 * - charFiltersで解析の前処理を行う. 例: 文書の正規化など
 * - tokenizerで文書のトークン化を行う
 * - tokenFilterで解析の後処理を行う. 例: 不要なトークンの除去など
 */
class Analyzer {
  /**
   * コンストラクタ
   * @param {Tokenizer} tokenizer
   * @param {CharFilter[]} charFilters
   * @param {TokenFilter[]} tokenFilters
   */
  constructor(tokenizer, charFilters = [], tokenFilters = []) {
    this.tokenizer = tokenizer;
    this.charFilters = charFilters;
    this.tokenFilters = tokenFilters;
  }

  /**
   * 文書の解析を行い、トークンに分割する
   * - charFiltersで解析の前処理を行う. 例: 文書の正規化など
   * - tokenizerで文書のトークン化を行う
   * - tokenFiltersで解析の後処理を行う. 例: 不要なトークンの除去など
   * @param {string} text
   * @return {Token[]}
   */
  analyze(text) {
    // FIXME: charFiltersをループで回してtextの正規化などを行う
    const filteredText = this.charFilters.reduce((text, charFilter) => {
      return charFilter.filter(text);
    }, text);
    // FIXME: インプットをトークンに分割
    const tokens = this.tokenizer.tokenize(filteredText);
    // FIXME: tokenFiltersをループで回して不要なトークンを取り除く
    return this.tokenFilters.reduce((tokens, tokenFilter) => {
      return tokens.filter((token) => tokenFilter.filter(token));
    }, tokens);
  }
}

module.exports = Analyzer;
