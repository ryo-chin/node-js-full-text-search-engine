const symbolPattern = /['"]/g;
class SymbolFilter {
  filter(text) {
    return text.replace(symbolPattern, '');
  }
}

exports.SymbolFilter = SymbolFilter;
