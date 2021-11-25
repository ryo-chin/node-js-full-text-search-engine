#!/usr/bin/env node

const PerformanceLogger = require('./util/performance-logger');
const WikipediaJSONDataLoader = require('./dump/wikipedia-json-data-loader');
const { buildDefaultIndexer } = require('./test/factory');
require('yargs')
  .scriptName('search-engine')
  .usage('$0 <cmd> [args]')
  .command(
    'index [input]',
    'index from wikipedia dump data',
    (yargs) => {
      yargs.positional('inputFilePath', {
        type: 'string',
        describe: 'wikipedia dump data file path',
      });
      yargs.positional('count', {
        type: 'number',
        default: 1000,
        describe: 'index count',
      });
    },
    async (argv) => {
      console.info(
        'args inputFilePath=',
        argv.inputFilePath,
        'count=',
        argv.count
      );
      const performanceLogger = new PerformanceLogger();
      const indexer = await buildDefaultIndexer();
      const parser = new WikipediaJSONDataLoader();
      const results = await parser.parse(argv.count, argv.inputFilePath);
      for (const [index, text] of results.map((res) => res.text).entries()) {
        await indexer.addDocument(text);
        console.info(`[${index + 1}] ${text.slice(0, 5)}`);
      }
      await indexer.flush();
      performanceLogger.end('index finish');
    }
  )
  .help().argv;
