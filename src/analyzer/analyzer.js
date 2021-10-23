class Analyzer {
  constructor(tokenizer, charFilters, tokenFilters) {
    this.tokenizer = tokenizer;
    this.charFilters = charFilters;
    this.tokenFilters = tokenFilters;
  }

  analyze(text) {
    const tokens = this.tokenizer.tokenize(text);
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
