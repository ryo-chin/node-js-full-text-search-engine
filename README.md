# 開発環境構築
## 事前準備
- nodeのインストール
  - LTSの `v16.13.0` を利用している
  - バージョン管理方法は任意
    - 本リポジトリはnvmでバージョン管理している
- VSCodeのインストール
  - https://azure.microsoft.com/ja-jp/products/visual-studio-code/
  - プラグインは以下を利用している
    - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    - [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode)

## 手順
```shell
npm install
```

# 性能検証
- 文書データとしてWikipediaのデータを利用する
- 以下と検索性能を比較してみる
  - grepコマンド
  - sqliteにLIKEクエリ

## Wikipediaダンプデータの用意方法

### 事前準備
以下をダウンロード & インストールする

- Wikipedia dump data
  - インデックスデータとして利用する
  - 以下からダウンロードすることができる
    - https://dumps.wikimedia.org/jawiki/latest/
    - `jawiki-latest-pages-articles.xml` に最新の全ての記事データが入っている
        - 2021/11/23時点では 14GB 程度
- WikiExtractor
  - Wikipediaのダンプデータ内の余分な文字列を取り除いて抽出してくれるPythonプラグイン
    - https://github.com/attardi/wikiextractor
  - githubからcloneして利用する
    ```shell
    git clone https://github.com/attardi/wikiextractor
    ```
  - xmlからjsonに変換することも可能
  - 実行にはPythonの3系が必要
- nkf
  - WikiExtractorが吐き出す [ユニコードエスケープ方式](http://una.soragoto.net/topics/12.html) の文字列を変換する際に利用
    - https://osdn.net/projects/nkf/
  - 以下のコマンドでinstallする（Macでbrewを使ってる場合）
    ```shell
    brew install nkf
    ```

### 手順

1. Wikipediaのxmlデータを解凍する
    - WikiExtractorは圧縮されたまま(bz2形式のまま)でも利用できるらしいので解凍しなくてもいいかも
2. WikiExtractorを実行して任意の場所に整形データを吐き出す
    - 以下はjson形式で 5GB ごとにファイルを出力した時のコマンド
    ```python
    python -m wikiextractor.WikiExtractor ~/Downloads/jawiki-latest-pages-articles.xml --processes 8 -o ~/projects/node-js-full-text-search-engine/db/wikipedia --json -b 5G
    ```
3. 必要な行数分を別ファイルに書き出し（任意）
    - そのままだとデータ量が多すぎて扱いづらい場合は必要分だけ切り出す
    - 1行1ドキュメントで吐き出されているのでheadコマンドなどで必要行数分を別ファイルに書き出す
    ```shell
     head -n 100000 db/wikipedia/AA/wiki_00 > db/wikipedia/dump/wikipedia_dump_100000.txt 
    ```
4. 整形したデータをnkfでデコードする（任意）
    - grepコマンドと比較するために行っているだけなので実行は任意
    ```shell
    cat db/wikipedia/dump/wikipedia_dump_100000.txt | sed 's/\\\u\(....\)/\&#x\1;/g' | nkf --numchar-input -w > db/wikipedia/dump/wikipedia_dump_100000_decoded.tx
    ```
    - 10万行だと大体500MBくらいになる
5. インデックスする
    - npmのコマンドで実行
    ```shell
    npm run index -- --inputFilePath ./db/wikipedia/dump/wikipedia_dump_100000.txt --outputFilePath ./db/database.sqlite  --count 10 --parallel 8
    ```

## 性能比較

### 条件
項目|条件
---|---
文書データ数|100000件
取得数制限|なし

### grep
```shell
time grep '{キーワード}' db/wikipedia/dump/wikipedia_dump_100000_decoded.txt
```

### sqlite
```sqlite
select key_id from documents
where body like '%{キーワード}%'
;
```

### search engine
```shell
npm run search -- --query '{キーワード}'
```