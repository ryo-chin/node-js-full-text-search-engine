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
    '文書データを読み込みインデックスを行う',
    // 引数オプション
    (yargs) => {
      yargs.positional('inputFilePath', {
        type: 'string',
        describe: '文書データのファイルパス',
      });
      yargs.positional('storagePath', {
        type: 'string',
        describe: 'ストレージのファイルパス(.sqliteファイルを想定)',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: 'インデックスする文書数',
      });
      yargs.positional('parallel', {
        type: 'number',
        default: 4,
        describe: 'flush時の並行処理数',
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
    'インデックスを用いてストレージから文書を検索する',
    // 引数オプション
    (yargs) => {
      yargs.positional('query', {
        type: 'string',
        describe: '検索するキーワード',
      });
      yargs.positional('storagePath', {
        type: 'string',
        default: './db/database.sqlite',
        describe: 'ストレージのファイルパス(.sqliteファイルを想定)',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: '文書の取得件数',
      });
      yargs.positional('andSearch', {
        type: 'boolean',
        default: false,
        describe: 'AND検索をするか、OR検索をするか (デフォルトはOR検索)',
      });
      yargs.positional('sort', {
        type: 'boolean',
        default: false,
        describe: 'ソートを行うか (デフォルトはしない)',
      });
    },
    // 処理
    async (args) => {
      await searchDocuments({
        query: args.query,
        storagePath: args.storagePath,
        count: args.count,
        andSearch: args.andSearch,
        sort: args.sort,
      });
    }
  )
  .help().argv;
