const WikipediaJSONDataLoader = require('./json-data-loader');

test('parse', async () => {
  const parser = new WikipediaJSONDataLoader();
  const filePath = './db/wikipedia/AA/wiki_00';
  const results = await parser.parse(4, filePath);
  console.log(results.map((res) => res.title));
});

test('dump', async () => {
  const parser = new WikipediaJSONDataLoader();
  const filePath = './db/wikipedia/AA/wiki_00';
  const output = './db/wikipedia/dump/documents.txt';
  await parser.dump(4, filePath, output);
});
