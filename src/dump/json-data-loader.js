//@ts-check

const fs = require('fs');
const readline = require('readline');

/**
 * 文書データJSONをファイルからロードするclass
 * - MB, GBサイズのファイルからも読み込めるようにStreamで必要件数(limit)分だけ読み出せるようになっている
 * - 以下の形式のJSONDataを読み込むことを想定している. WikipediaのXMLをWikiExtractorで読み込んだ際のJSON
 * {
 *   id: ,
 *   revid: ,
 *   url: ,
 *   title: ,
 *   text: ,
 * }
 */
class JSONDataLoader {
  /**
   * ファイルからJSONを読み込み、パースする
   * @param {number} limit
   * @param {string} inputFile
   * @return {Promise<any[]>}
   */
  async parse(limit, inputFile) {
    const rs = fs.createReadStream(inputFile);
    const rl = readline.createInterface(rs);

    let results = [];

    return new Promise((resolve, reject) => {
      try {
        rl.on('close', () => {
          console.info('read document data complete');
          resolve(results);
        });
        rl.on('line', (value) => {
          if (results.length === limit) {
            rl.close();
            return;
          }
          results.push(JSON.parse(value));
        });
        console.info('read document data start');
      } catch (e) {
        reject(e);
      }
    }).finally(() => {
      rs.close();
    });
  }

  /**
   * 入力ファイル(inputFile)から出力ファイル(outputFile)へ指定行数(limit)コピーする
   * @param {number} limit
   * @param {string} inputFile
   * @param {string} outputFile
   */
  async dump(limit, inputFile, outputFile) {
    const rs = fs.createReadStream(inputFile);
    const ws = fs.createWriteStream(outputFile);
    const rl = readline.createInterface(rs);
    let parsed = 0;

    return new Promise((resolve, reject) => {
      try {
        rl.on('line', (value) => {
          if (parsed >= limit) {
            rl.close();
            resolve();
            return;
          }
          ws.write(`${JSON.stringify(JSON.parse(value))}\n`);
          parsed = ++parsed;
        });
      } catch (e) {
        reject(e);
      }
    }).finally(() => {
      rs.close();
      ws.close();
    });
  }
}

module.exports = JSONDataLoader;
