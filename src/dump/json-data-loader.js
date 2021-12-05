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

    console.info('start read json data...');
    return new Promise((resolve, reject) => {
      try {
        rl.on('close', () => {
          console.info('complete read json data!');
          resolve(results);
        });
        rl.on('line', (value) => {
          if (parsed >= limit) {
            console.info(`read json data at limit=${limit}`);
            rl.close();
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
