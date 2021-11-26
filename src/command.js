#!/usr/bin/env node

const indexByExternalData = require('./commands/index-by-external-data.js');
const search = require('./commands/search.js');

require('yargs')
  .scriptName('search-engine')
  .usage('$0 <cmd> [args]')
  .command(
    'index [input]',
    'index from wikipedia dump data',
    (yargs) => {
      yargs.positional('inputFilePath', {
        type: 'string',
        describe: 'json dump data file path',
      });
      yargs.positional('outputFilePath', {
        type: 'string',
        describe: 'output file path (sqlite3)',
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
    async (argv) => {
      await indexByExternalData({
        inputFilePath: argv.inputFilePath,
        outputFilePath: argv.outputFilePath,
        count: argv.count,
        parallel: argv.parallel,
      });
    }
  )
  .command(
    'search [input]',
    'search from index',
    (yargs) => {
      yargs.positional('query', {
        type: 'string',
        describe: 'search query',
      });
      yargs.positional('indexPath', {
        type: 'string',
        describe: 'index storage path (sqlite3)',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: 'fetch count',
      });
    },
    async (argv) => {
      await search({
        query: argv.query,
        indexPath: argv.indexPath,
        count: argv.count,
      });
    }
  )
  .help().argv;
