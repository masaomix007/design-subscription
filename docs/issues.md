# Issues

## 目次

- [概要](#概要)
- [既知の不具合一覧](#既知の不具合一覧)
- [詳細](#詳細)

## 概要

このドキュメントは、コード調査と `npm run lint` の結果から確認された既知の不具合のみを記録します。

状態は以下のいずれかで管理します。

- 未対応
- 調査中
- 対応済

## 既知の不具合一覧

| 優先度 | 状態 | 現象 | 関連ファイル |
| --- | --- | --- | --- |
| 高 | 未対応 | ログイン後にローディングから抜けない可能性 | `src/pages/Login.jsx` |
| 高 | 未対応 | 顧客詳細で本人以外の顧客IDを画面側で拒否していない | `src/App.jsx`, `src/pages/CustomerDetail.jsx` |
| 高 | 未対応 | 制作実績編集時の `updateWork` 呼び出し引数が定義と一致していない | `src/components/TaskForm.jsx`, `src/contexts/DataContext.jsx` |
| 中 | 未対応 | `TaskList.jsx` が現在のContextと不整合 | `src/components/TaskList.jsx`, `src/contexts/DataContext.jsx` |
| 中 | 未対応 | `Works.jsx` が現在のContextと不整合 | `src/pages/Works.jsx`, `src/contexts/DataContext.jsx` |
| 中 | 未対応 | `npm run lint` が失敗する | 複数 |
| 中 | 未対応 | `works` と `transactions` の削除処理がない | `src/contexts/DataContext.jsx` |

## 詳細

### ログイン後にローディングから抜けない可能性

| 項目 | 内容 |
| --- | --- |
| 現象 | ログイン成功後、画面がローディング表示のままになる可能性があります |
| 原因候補 | `isLoggingIn` がログイン成功後に `false` に戻されず、ログイン後リダイレクトの `useEffect` が `isLoggingIn` によりreturnする可能性があります |
| 関連ファイル | `src/pages/Login.jsx` |
| 優先度 | 高 |
| 状態 | 未対応 |

### 顧客詳細で本人以外の顧客IDを画面側で拒否していない

| 項目 | 内容 |
| --- | --- |
| 現象 | 顧客ユーザーが `/customers/:id` にアクセスした場合、画面側では本人の顧客IDかどうかを検証していません |
| 原因候補 | `/customers/:id` が `ProtectedRoute` のみで保護され、本人確認用のルートガードがありません |
| 関連ファイル | `src/App.jsx`, `src/pages/CustomerDetail.jsx` |
| 優先度 | 高 |
| 状態 | 未対応 |

### 制作実績編集時のupdateWork呼び出し引数が定義と一致していない

| 項目 | 内容 |
| --- | --- |
| 現象 | 制作実績編集時に正しいドキュメントが更新されない可能性があります |
| 原因候補 | `updateWork(workId, workData)` 定義に対し、`TaskForm.jsx` は `updateWork(customerId, task.id, payload)` と3引数で呼び出しています |
| 関連ファイル | `src/components/TaskForm.jsx`, `src/contexts/DataContext.jsx` |
| 優先度 | 高 |
| 状態 | 未対応 |

### TaskList.jsxが現在のContextと不整合

| 項目 | 内容 |
| --- | --- |
| 現象 | `TaskList.jsx` を使用した場合、期待するデータや関数が存在しない可能性があります |
| 原因候補 | `useData()` から `role`, `deleteTask`, 配列としての `tasks` を取得していますが、現在のContextはその形では提供していません |
| 関連ファイル | `src/components/TaskList.jsx`, `src/contexts/DataContext.jsx` |
| 優先度 | 中 |
| 状態 | 未対応 |

### Works.jsxが現在のContextと不整合

| 項目 | 内容 |
| --- | --- |
| 現象 | `Works.jsx` を使用した場合、`publishedWorks` が存在せずエラーになる可能性があります |
| 原因候補 | `useData()` から `publishedWorks` を取得していますが、現在のContextは提供していません |
| 関連ファイル | `src/pages/Works.jsx`, `src/contexts/DataContext.jsx` |
| 優先度 | 中 |
| 状態 | 未対応 |

### npm run lintが失敗する

| 項目 | 内容 |
| --- | --- |
| 現象 | `npm run lint` が6件のエラーで失敗します |
| 原因候補 | 未使用import、未使用catch変数、Fast Refreshのexport構成 |
| 関連ファイル | `src/contexts/DataContext.jsx`, `src/pages/CustomerDetail.jsx`, `src/pages/Login.jsx` |
| 優先度 | 中 |
| 状態 | 未対応 |

確認されたLintエラー:

- `src/contexts/DataContext.jsx`: `query`, `orderBy` が未使用
- `src/contexts/DataContext.jsx`: Fast Refreshのexport構成に関するエラー
- `src/pages/CustomerDetail.jsx`: 未使用のcatch変数
- `src/pages/Login.jsx`: 未使用のcatch変数

### worksとtransactionsの削除処理がない

| 項目 | 内容 |
| --- | --- |
| 現象 | 制作実績やポイント取引を削除する処理がコード上で確認できません |
| 原因候補 | `deleteDoc` を使った削除実装が `works` と `transactions` に存在しません |
| 関連ファイル | `src/contexts/DataContext.jsx`, `src/components/TaskList.jsx` |
| 優先度 | 中 |
| 状態 | 未対応 |

