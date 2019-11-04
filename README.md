# Infra-Workshop Recording Bot

このBOTはインフラ勉強会でセッションを録画するためのBOTです。

## 起動方法

`./resources/tokens.json`に次のようなjsonをおいて`docker-compose.yml`を実行させてください。
```json
{
  "discord": "<discordのトークン>",
  "google": {
    "clientId": "<googleのOauth2のclientId>",
    "secret": "<googleのOauth2のclientSecret>"
  }
}
```

### `refresh_token`について
起動する初回はとログにリンクが表示されるのでそこに飛んで動画をアップロードする権限を与えてください。
権限を与えると`localhost:3000`に飛ばされます。もし別のPCからリンクにアクセスした場合は`localhost`をbotが動いているサーバーのipに書き換えてください。
このbotが権限を受け取ると`tokens.json`の`google.refresh_token`に`refresh_token`を書き込みます。次回以降の起動ではこの値を使用します。
