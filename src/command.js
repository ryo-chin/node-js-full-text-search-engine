#!/usr/bin/env node

const indexByExternalData = require('./commands/index-by-external-data.js');
const searchDocuments = require('./commands/search-documents.js');

/**
 * yargsを利用したコマンド群
 * ref. https://github.com/yargs/yargs
 */
require('yargs')
  .scriptName('search-engine')
  .usage('$0 <cmd> [args]')
  /**
   * インデックスを実行するためのコマンド
   */
  .command(
    // コマンド
    'index',
    // 説明
    'index from wikipedia dump data',
    // 引数オプション
    (yargs) => {
      yargs.positional('inputFilePath', {
        type: 'string',
        describe: 'json dump data file path',
      });
      yargs.positional('storagePath', {
        type: 'string',
        describe: 'storage file path (sqlite3)',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: 'index count',
      });
      yargs.positional('parallel', {
        type: 'number',
        default: 4,
        describe: 'parallel number at flush',
      });
    },
    // 処理
    async (args) => {
      await indexByExternalData({
        inputFilePath: args.inputFilePath,
        storagePath: args.storagePath,
        count: args.count,
        parallel: args.parallel,
      });
    }
  )
  /**
   * 検索するためのコマンド
   */
  .command(
    // コマンド
    'search',
    // 説明
    'search from index',
    // 引数オプション
    (yargs) => {
      yargs.positional('query', {
        type: 'string',
        describe: 'search query',
      });
      yargs.positional('storagePath', {
        type: 'string',
        default: './db/database.sqlite',
        describe: 'index storage path (sqlite3)',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: 'fetch count',
      });
    },
    // 処理
    async (args) => {
      await searchDocuments({
        query: args.query,
        storagePath: args.storagePath,
        count: args.count,
      });
    }
  )
  .help().argv;
