#!/usr/bin/env node

const indexByExternalData = require('./commands/index-by-external-data.js');

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
    },
    async (argv) => {
      await indexByExternalData({
        inputFilePath: argv.inputFilePath,
        outputFilePath: argv.outputFilePath,
        count: argv.count,
      });
    }
  )
  .help().argv;
