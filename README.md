# used npm packages
- kuromoji

## development

- nodemon
- prettier
- jest

## Dump Wikipedia data
download from https://dumps.wikimedia.org/jawiki/latest/

convert xml to json by [attardi/wikiextractor](https://github.com/attardi/wikiextractor).
```python
python -m wikiextractor.WikiExtractor ~/Downloads/jawiki-latest-pages-articles.xml --processes 8 -o /Users/ryohei.yamamoto/projects/node-js-full-text-search-engine/db/wikipedia --json -b 5G
```
