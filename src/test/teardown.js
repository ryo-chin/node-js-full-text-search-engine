const fs = require('fs-extra');

function teardown() {
  fs.removeSync('./tmp');
}

module.exports = teardown;
