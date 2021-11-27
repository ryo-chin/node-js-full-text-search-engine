//@ts-check

const { CharFilter } = require('./char-filters');
const { TokenFilter } = require('./token-filters');
const { Tokenizer } = require('./tokenizer');

class Analyzer {
  /**
   * @param {Tokenizer} tokenizer
   * @param {CharFilter[]} charFilters
   * @param {TokenFilter[]} tokenFilters
   */
  constructor(tokenizer, charFilters, tokenFilters) {
    this.tokenizer = tokenizer;
    this.charFilters = charFilters;
    this.tokenFilters = tokenFilters;
  }

  /**
   * @param {string} text
   * @return {Token[]}
   */
  analyze(text) {
    const filteredText = this.charFilters.reduce((text, filter) => {
      return filter.filter(text);
    }, text);
    const tokens = this.tokenizer.tokenize(filteredText);
    return tokens
      .map((token) => {
        let filtered = token;
        this.tokenFilters.forEach((filter) => {
          if (!token) {
            return;
          }
          filtered = filter.filter(token);
        });
        return filtered;
      })
      .filter((token) => !!token);
  }
}

module.exports = Analyzer;
