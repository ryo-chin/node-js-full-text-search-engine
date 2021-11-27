//@ts-check
const { v4: uuidv4 } = require('uuid');

class UUIDGenerator {
  /**
   * @returns {string}
   */
  generate() {
    return uuidv4();
  }
}

module.exports = UUIDGenerator;
