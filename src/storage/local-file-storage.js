//@ts-check

const InvertedIndex = require('../data/inverted-index');
const Posting = require('../data/posting');
const sqlite3 = require('sqlite3').verbose();

const KEY_COLUMN = 'key_id';
const VALUE_COLUMN = 'body';
const DOCUMENTS_TABLE_NAME = 'documents';
const INDEXES_TABLE_NAME = 'inverted_indexes';

class LocalFileStorage {
  /**
   * @param {string} [file]
   * @return {Promise<LocalFileStorage>}
   */
  static async build(file) {
    const initializeKeyValueTable = (dbCon, tableName) => {
      return new Promise((resolve, reject) => {
        dbCon.run(
          `CREATE TABLE IF NOT EXISTS ${tableName} (${KEY_COLUMN} string NOT NULL PRIMARY KEY, ${VALUE_COLUMN} json NOT NULL)`,
          (err) => (err ? reject(err) : resolve())
        );
      });
    };

    const dbConnection = await new Promise((resolve, reject) => {
      const dbCon = new sqlite3.Database(file || ':memory:', (err) => {
        if (err) {
          reject(err);
        }
        resolve(dbCon);
      });
    });

    await initializeKeyValueTable(dbConnection, DOCUMENTS_TABLE_NAME);
    await initializeKeyValueTable(dbConnection, INDEXES_TABLE_NAME);

    return new LocalFileStorage(dbConnection);
  }

  constructor(dbConnection) {
    this.dbConnection = dbConnection;
  }

  /**
   * @param {import("../data/document-data")} document
   */
  async saveDocument(document) {
    return this._set(
      DOCUMENTS_TABLE_NAME,
      document.documentId,
      JSON.stringify(document)
    );
  }

  /**
   * @param {import("../data/document-data")[]} documents
   */
  async saveDocuments(documents) {
    return this._saveAll(DOCUMENTS_TABLE_NAME, 'documentId', documents);
  }

  /**
   * @param {{ indexId: any; }} invertedIndex
   */
  async saveIndex(invertedIndex) {
    return this._set(
      INDEXES_TABLE_NAME,
      invertedIndex.indexId,
      JSON.stringify(invertedIndex)
    );
  }

  /**
   * @param {any[]} indexes
   */
  async saveIndexes(indexes) {
    return this._saveAll(INDEXES_TABLE_NAME, 'indexId', indexes);
  }

  async loadDocument(documentId) {
    return this.loadDocuments([documentId]).then((docs) => docs[0]);
  }

  async loadDocuments(documentIds) {
    return this._loadAll(DOCUMENTS_TABLE_NAME, documentIds);
  }

  async loadIndex(indexId) {
    return this.loadIndexes([indexId]).then((indexes) => indexes[0]);
  }

  /**
   * @param {string[]} indexIds
   */
  async loadIndexes(indexIds) {
    return this._loadAll(INDEXES_TABLE_NAME, indexIds, (body) => {
      return new InvertedIndex(
        body.indexId,
        body.token,
        body.postings.map(
          (posting) => new Posting(posting.documentId, posting.useCount)
        )
      );
    });
  }

  async shutdown() {
    return new Promise((resolve, reject) => {
      this.dbConnection.close((err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * @param {string} tableName
   * @param {string} idPropName
   * @param {any[]} inputs
   */
  async _saveAll(tableName, idPropName, inputs) {
    return Promise.all(
      inputs.map((input) => {
        const key = input[idPropName];
        const value = JSON.stringify(input);
        return this._set(tableName, key, value);
      })
    );
  }

  /**
   * @param {string} tableName
   * @param {string[]} ids
   * @param {(arg0: any) => any } [parser]
   */
  async _loadAll(tableName, ids, parser) {
    return Promise.all(ids.map((id) => this._get(tableName, id, parser)));
  }

  /**
   * @param {string} tableName
   * @param {string} key
   * @param {string} value
   */
  async _set(tableName, key, value) {
    const escapedKey = this.escape(key);
    const escapedValue = this.escape(value);
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${tableName} (${KEY_COLUMN}, ${VALUE_COLUMN})
       VALUES ('${escapedKey}', '${escapedValue}')
       ON CONFLICT(${KEY_COLUMN}) DO UPDATE SET ${VALUE_COLUMN} = '${escapedValue}';`;
      // console.log(`exec sql: ${query}`);
      this.dbConnection.run(query, (err) => {
        // console.log(
        //   `set to ${tableName}: key=${escapedKey}, value=${escapedValue}`
        // );
        return err ? reject(err) : resolve();
      });
    });
  }

  /**
   * @param {string} tableName
   * @param {string} key
   * @param {(arg0: string) => any} parser
   */
  async _get(tableName, key, parser) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ${KEY_COLUMN}, ${VALUE_COLUMN} FROM ${tableName} WHERE ${KEY_COLUMN} = '${key}';`;
      // console.log(`exec sql: ${query}`);
      this.dbConnection.get(query, (err, row) => {
        if (err) {
          return reject(err);
        }
        // console.log(`get from ${tableName}: row=${JSON.stringify(row)}`);
        if (!row) {
          return resolve(null);
        }
        const body = JSON.parse(row[VALUE_COLUMN]);
        const parsedBody = parser ? parser(body) : body;
        resolve(parsedBody);
      });
    });
  }

  /**
   * @param {string} text
   * @return {string}
   */
  escape(text) {
    return text.replace(/'/g, "''");
  }
}

module.exports = LocalFileStorage;
