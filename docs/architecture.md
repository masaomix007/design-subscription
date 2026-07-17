# Architecture

## 目次

- [システム概要](#システム概要)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [コンポーネント構成](#コンポーネント構成)
- [Context構成](#context構成)
- [主要ページ](#主要ページ)
- [データフロー](#データフロー)
- [Firebaseとの接続概要](#firebaseとの接続概要)

## システム概要

このプロジェクトは、React + Viteで実装されたデザイン制作サブスクリプション向けの管理Webアプリケーションです。

コード上では、Firebase Authenticationでログイン状態を管理し、Cloud Firestoreから顧客、プラン、制作実績、ポイント取引、制作物マスタを読み書きしています。

## 技術スタック

`package.json` と `npm list --depth=0` で確認した主な構成です。

| 種別 | 技術 | バージョン |
| --- | --- | --- |
| Runtime | Node.js | v22.20.0 |
| Package manager | npm | 10.9.3 |
| Frontend | React | 19.2.3 |
| Frontend | React DOM | 19.2.3 |
| Routing | React Router DOM | 7.10.1 |
| Build tool | Vite | 7.3.0 |
| Firebase SDK | firebase | 12.8.0 |
| UI | MUI | 7.3.6 |
| Date picker | MUI X Date Pickers | 8.25.0 |
| Date utility | date-fns | 4.1.0 |
| Notification | notistack | 3.0.2 |
| Lint | ESLint | 9.39.2 |

## ディレクトリ構成

```text
.
├── .idx/
├── .history/
├── docs/
│   └── analysis/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── TaskForm.jsx
│   │   └── TaskList.jsx
│   ├── contexts/
│   │   └── DataContext.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── pages/
│   │   ├── CustomerDetail.jsx
│   │   ├── CustomerList.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── PlanList.jsx
│   │   ├── Works.jsx
│   │   └── WorksCatalog.jsx
│   ├── App.jsx
│   ├── firebase.js
│   └── main.jsx
├── AGENTS.md
├── GEMINI.md
├── blueprint.md
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

## コンポーネント構成

| ファイル | 役割 |
| --- | --- |
| `src/App.jsx` | ルーティング、認証済みルート、管理者専用ルートを定義 |
| `src/components/Layout.jsx` | ログイン後の共通レイアウト、サイドメニュー、ログアウト |
| `src/components/TaskForm.jsx` | 制作実績の作成・編集用ダイアログ |
| `src/components/TaskList.jsx` | 制作実績一覧用コンポーネント。ただし現在のContextと不整合あり |

## Context構成

`src/contexts/DataContext.jsx` がアプリケーション共通データを提供しています。

提供している主な値:

| 値 | 内容 |
| --- | --- |
| `user` | Firebase AuthユーザーとFirestore `users/{uid}` のデータを統合したユーザー情報 |
| `customers` | `customers` コレクションの一覧 |
| `currentUserCustomer` | 顧客ユーザーのメールアドレスに一致する顧客データ |
| `plans` | `plans` コレクションの一覧 |
| `works` | `works` コレクションを顧客IDごとにまとめたオブジェクト |
| `tasks` | `works` の別名 |
| `transactions` | `transactions` コレクションを顧客IDごとにまとめたオブジェクト |
| `worksCatalog` | `worksCatalog` コレクションの一覧 |
| `loading` | Firestoreデータ読み込み状態 |
| `authLoading` | Firebase Authentication状態読み込み状態 |
| `addWork` / `addTask` | 制作実績を作成 |
| `updateWork` / `updateTask` | 制作実績を更新 |
| `getCustomerPlanDetails` | `planId` からプラン情報を取得 |

## 主要ページ

| ルート | コンポーネント | 概要 |
| --- | --- | --- |
| `/login` | `Login.jsx` | メールアドレス/パスワードでログイン |
| `/dashboard` | `Dashboard.jsx` | 管理者または顧客向けダッシュボード |
| `/customers` | `CustomerList.jsx` | 顧客一覧。`AdminRoute` 配下 |
| `/customers/:id` | `CustomerDetail.jsx` | 顧客詳細、制作実績、ポイント取引履歴 |
| `/plans` | `PlanList.jsx` | プラン一覧。`AdminRoute` 配下 |
| `/works-catalog` | `WorksCatalog.jsx` | 制作物マスタ。`AdminRoute` 配下 |

`Works.jsx` はファイルとして存在しますが、`App.jsx` のルートには登録されていません。

## データフロー

1. `main.jsx` がReactアプリを起動します。
2. `App.jsx` が `BrowserRouter` と `DataProvider` でアプリ全体をラップします。
3. `DataContext.jsx` が `onAuthStateChanged` でログイン状態を監視します。
4. ログインユーザーが存在する場合、Firestoreの `users/{uid}` を読み取ります。
5. `DataContext.jsx` が `customers`, `plans`, `works`, `transactions`, `worksCatalog` を `onSnapshot` で購読します。
6. 各ページは `useData()` 経由でContextのデータと操作関数を利用します。
7. 作成・更新・削除は各ページまたはContext内からFirestore SDKを直接呼び出します。

## Firebaseとの接続概要

Firebase初期化は `src/firebase.js` に集約されています。

| 項目 | 内容 |
| --- | --- |
| 初期化 | `initializeApp(firebaseConfig)` |
| Firestore | `getFirestore(app)` を `db` としてexport |
| Authentication | `getAuth(app)` を `auth` としてexport |
| Firebase projectId | `design-subscription-5675-d0f6d` |

