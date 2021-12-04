//@ts-check
const { v4: uuidv4 } = require('uuid');

/**
 * ランダムなユニークIDを発行するclass
 * - 文書IDの発行などに利用する
 */
class UUIDGenerator {
  /**
   * UUIDを発行する
   * @returns {string}
   */
  generate() {
    return uuidv4();
  }
}

module.exports = UUIDGenerator;
