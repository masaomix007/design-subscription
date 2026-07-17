# Development

## 目次

- [開発環境](#開発環境)
- [Node/npm](#nodenpm)
- [VS Code](#vs-code)
- [GitHub運用](#github運用)
- [Firebaseバックエンド利用方針](#firebaseバックエンド利用方針)
- [Firestore利用方針](#firestore利用方針)
- [開発時の注意事項](#開発時の注意事項)
- [npm run lint の現状](#npm-run-lint-の現状)
- [AI開発前提](#ai開発前提)

## 開発環境

現在の開発前提:

- Windows 11
- VS Code
- Codex
- Node.js
- npm
- React
- Vite
- GitHub
- Cloud Firestore
- Firebase Authentication

Firebase Studioは今後使用しない方針です。

## Node/npm

確認済みバージョン:

| ツール | バージョン |
| --- | --- |
| Node.js | v22.20.0 |
| npm | 10.9.3 |

主要コマンド:

| コマンド | 用途 |
| --- | --- |
| `npm install` | 依存パッケージのインストール |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド成果物のプレビュー |
| `npm run lint` | ESLint実行 |

## VS Code

VS Code用のワークスペースファイルとして `design-subscription.code-workspace` が存在します。

Firebase Studio / IDX由来の `.idx/` と `GEMINI.md` も存在しますが、今後の主開発環境はVS Codeです。

## GitHub運用

このリポジトリにはGit履歴があります。

運用ルールはコード上では確認できません。

要確認:

- mainブランチ運用
- featureブランチ運用
- Pull Requestの有無
- レビュー方針
- リリースタグの有無

## Firebaseバックエンド利用方針

FirestoreとFirebase Authenticationは継続利用します。

Firebase初期化は `src/firebase.js` にあります。

確認済みFirebase projectId:

```text
design-subscription-5675-d0f6d
```

Firebase Hostingを利用する設定はコード上では確認できません。

## Firestore利用方針

コード上で確認できるFirestoreコレクション:

- `users`
- `customers`
- `plans`
- `works`
- `transactions`
- `worksCatalog`

Firestoreの読み取りは主に `src/contexts/DataContext.jsx` の `onSnapshot` で行われます。

作成・更新・削除は以下に分散しています。

- `src/contexts/DataContext.jsx`
- `src/pages/CustomerList.jsx`
- `src/pages/CustomerDetail.jsx`
- `src/pages/PlanList.jsx`
- `src/pages/WorksCatalog.jsx`

## 開発時の注意事項

- Firestore Rulesはリポジトリ内で確認できません。
- 顧客本人のアクセス制御は画面側だけで完結していません。
- `users/{uid}.role` が管理者判定に使われます。
- `users/{uid}` が存在しない場合、コード上では `customer` として扱われます。
- `works` はトップレベルコレクションです。
- `transactions` もトップレベルコレクションです。
- `TaskList.jsx` と `Works.jsx` は現在のContextと不整合があります。
- Firebase Studio由来の `.idx/` と `GEMINI.md` は残っています。

## npm run lint の現状

`npm run lint` は失敗します。

確認されたエラー:

| ファイル | 内容 |
| --- | --- |
| `src/contexts/DataContext.jsx` | `query`, `orderBy` が未使用 |
| `src/contexts/DataContext.jsx` | Fast Refreshのexport構成に関する警告 |
| `src/pages/CustomerDetail.jsx` | 未使用のcatch変数 |
| `src/pages/Login.jsx` | 未使用のcatch変数 |

## AI開発前提

今後の開発ではCodex / Claude CodeなどのAI支援を利用する前提です。

AIで作業する際の前提:

- 変更前に関連ファイルを読む。
- Firestoreのコレクション名とフィールド名を推測で追加しない。
- Firebase Hosting前提の提案をしない。
- さくらサーバー公開時はViteの静的ビルドを前提に確認する。
- 認証・権限制御の変更時はFirestore Rules側の確認事項を明記する。
- 既存のFirebase Studio由来ファイルを削除・変更する場合は目的を明確にする。

