const skipPos = ['助詞', '助動詞', '記号', '接頭詞'];
class POSFilter {
  filter(token) {
    return !skipPos.includes(token.pos) ? token : null;
  }
}

exports.POSFilter = POSFilter;
