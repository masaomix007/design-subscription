# Deployment

## 目次

- [概要](#概要)
- [npm run dev](#npm-run-dev)
- [npm run build](#npm-run-build)
- [npm run preview](#npm-run-preview)
- [Vite設定](#vite設定)
- [dist生成](#dist生成)
- [さくらサーバーへの配置](#さくらサーバーへの配置)
- [BrowserRouter利用時の注意点](#browserrouter利用時の注意点)
- [Firebase Hostingを利用しない方針](#firebase-hostingを利用しない方針)
- [要確認事項](#要確認事項)

## 概要

このプロジェクトはViteでビルドするReact SPAです。

FirebaseはFirestoreとAuthenticationのバックエンドとして利用しています。公開先としてFirebase Hostingを使う設定はコード上では確認できません。

## npm run dev

`package.json` の定義:

```bash
npm run dev
```

実行内容:

```bash
vite
```

用途:

- ローカル開発サーバーを起動します。

## npm run build

`package.json` の定義:

```bash
npm run build
```

実行内容:

```bash
vite build
```

用途:

- 本番配信用の静的ファイルを生成します。

## npm run preview

`package.json` の定義:

```bash
npm run preview
```

実行内容:

```bash
vite preview
```

用途:

- `npm run build` 後の成果物をローカルで確認します。

## Vite設定

`vite.config.js` の設定:

```js
export default defineConfig({
  base: './',
  plugins: [react()],
})
```

確認できる内容:

- React pluginを使用しています。
- `base: './'` が設定されています。

## dist生成

Viteの標準動作として、`npm run build` により `dist/` が生成されます。

このリポジトリ内では、`dist/` の生成物やデプロイスクリプトは確認していません。

## さくらサーバーへの配置

コード上で確認できる、さくらサーバー専用の設定やスクリプトはありません。

要確認:

- さくらサーバーの配置先ディレクトリ
- FTP、SFTP、SSH、コントロールパネルのどれでアップロードするか
- 独自ドメインまたはサブディレクトリ配信の有無
- `.htaccess` の有無と内容

## BrowserRouter利用時の注意点

`src/App.jsx` では `BrowserRouter` を使用しています。

BrowserRouterを静的ホスティングで使う場合、直接URLを開いたときやリロード時にサーバー側でSPA fallbackが必要になる場合があります。

このリポジトリ内では、さくらサーバー用の `.htaccess` は確認できません。

要確認:

- `/dashboard`
- `/customers/:id`
- `/plans`
- `/works-catalog`

上記のようなURLを直接開いたときに `index.html` へフォールバックされること。

## Firebase Hostingを利用しない方針

このプロジェクトでは、FirestoreとFirebase Authenticationは継続利用します。

公開先はさくらのレンタルサーバーとする方針です。

コード上ではFirebase Hosting用の設定は確認できません。

## 要確認事項

| 項目 | 状態 |
| --- | --- |
| さくらサーバーの公開ディレクトリ | 要確認 |
| アップロード方法 | 要確認 |
| SPA fallback用 `.htaccess` | 要確認 |
| 本番URL | 要確認 |
| Firebase許可ドメイン設定 | 要確認 |
| 環境変数運用 | 要確認 |

