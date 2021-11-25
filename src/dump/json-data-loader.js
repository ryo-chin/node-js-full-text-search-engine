const fs = require('fs');
const readline = require('readline');

class JSONDataLoader {
  /**
   * result json
   * {
   *   id: ,
   *   revid: ,
   *   url: ,
   *   title: ,
   *   text: ,
   * }
   */
  async parse(limit, inputFile) {
    const rs = fs.createReadStream(inputFile);
    const rl = readline.createInterface(rs);

    let parsed = 0;
    let results = [];

    return new Promise((resolve, reject) => {
      try {
        rl.on('line', (value) => {
          if (parsed >= limit) {
            rl.close();
            resolve(results);
            return;
          }
          results.push(JSON.parse(value));
          parsed = ++parsed;
        });
      } catch (e) {
        reject(e);
      }
    }).finally(() => {
      rs.close();
    });
  }

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
