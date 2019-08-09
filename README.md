
## ディレクトリ構造
```
project
 |- ts
 |  |- 各種モジュール
 |- resources
 |   スクリプトから直接読み込まれるファイル
 |- dist
    |- js
    |  tscの結果
    |- browser
    |  browser用のビルドの結果
    |- node
    |  node.js用のビルドの結果
    |- resources
       project/resourcesのコピー
       requireで読む前提でこの位置
```

