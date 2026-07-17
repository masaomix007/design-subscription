# Firestore Schema

## 目次

- [概要](#概要)
- [コレクション一覧](#コレクション一覧)
- [users](#users)
- [customers](#customers)
- [plans](#plans)
- [works](#works)
- [transactions](#transactions)
- [worksCatalog](#workscatalog)

## 概要

このドキュメントは、コードから確認できるFirestoreコレクション、フィールド、読み書き箇所を整理したものです。

Firestore Rules、既存データの実値、インデックス設定はリポジトリ内で確認できません。

## コレクション一覧

| コレクション | 用途 |
| --- | --- |
| `users` | Firebase Authユーザーに紐づくロール管理 |
| `customers` | 顧客情報 |
| `plans` | 契約プラン |
| `works` | 制作実績 |
| `transactions` | ポイント取引 |
| `worksCatalog` | 制作物マスタ |

## users

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `users` |
| 主なフィールド | `role` |
| 用途 | Firebase Authユーザーの権限判定 |
| 作成箇所 | コード上では確認できません |
| 更新箇所 | コード上では確認できません |
| 削除箇所 | コード上では確認できません |
| 読み取り箇所 | `src/contexts/DataContext.jsx` の `getDoc(doc(db, 'users', currentUser.uid))` |

補足:

- `users/{uid}` のドキュメントIDはFirebase AuthのUIDとして参照されています。
- `users/{uid}` が存在しない場合、コード上では `role: 'customer'` が設定されます。

## customers

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `customers` |
| 主なフィールド | `name`, `planId`, `email`, `contactName`, `memo`, `createdAt`, `updatedAt` |
| 用途 | 顧客情報の管理 |
| 作成箇所 | `src/pages/CustomerList.jsx` |
| 更新箇所 | `src/pages/CustomerList.jsx` |
| 削除箇所 | `src/pages/CustomerList.jsx` |
| 読み取り箇所 | `src/contexts/DataContext.jsx` |

読み取り:

- `onSnapshot(collection(db, 'customers'))`

作成時のフィールド:

- `name`
- `planId`
- `email`
- `contactName`
- `memo`
- `updatedAt`
- `createdAt`

更新時のフィールド:

- `name`
- `planId`
- `email`
- `contactName`
- `memo`
- `updatedAt`

## plans

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `plans` |
| 主なフィールド | `name`, `monthlyPoints`, `canCarryOver`, `notes`, `createdAt`, `updatedAt` |
| 用途 | 契約プランの管理 |
| 作成箇所 | `src/pages/PlanList.jsx` |
| 更新箇所 | `src/pages/PlanList.jsx` |
| 削除箇所 | `src/pages/PlanList.jsx` |
| 読み取り箇所 | `src/contexts/DataContext.jsx` |

読み取り:

- `onSnapshot(collection(db, 'plans'))`

作成時のフィールド:

- `name`
- `monthlyPoints`
- `canCarryOver`
- `notes`
- `updatedAt`
- `createdAt`

更新時のフィールド:

- `name`
- `monthlyPoints`
- `canCarryOver`
- `notes`
- `updatedAt`

## works

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `works` |
| 主なフィールド | `customerId`, `clientId`, `name`, `category`, `pointsUsed`, `status`, `dateUsed`, `deliveryUrl`, `memo`, `createdAt`, `updatedAt` |
| 用途 | 顧客ごとの制作実績 |
| 作成箇所 | `src/contexts/DataContext.jsx` の `addWork` |
| 更新箇所 | `src/contexts/DataContext.jsx` の `updateWork` |
| 削除箇所 | コード上では確認できません |
| 読み取り箇所 | `src/contexts/DataContext.jsx` |

読み取り:

- `onSnapshot(collection(db, 'works'))`
- 読み取り時は `customerId || clientId` を顧客IDとして扱っています。

作成時のフィールド:

- `workData` に含まれるフィールド
- `customerId`
- `createdAt`

更新時のフィールド:

- `workData` に含まれるフィールド
- `updatedAt`

`TaskForm.jsx` から渡される主なフィールド:

- `name`
- `status`
- `dateUsed`
- `deliveryUrl`
- `memo`
- `pointsUsed`
- `category`

## transactions

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `transactions` |
| 主なフィールド | `customerId`, `type`, `description`, `points`, `date`, `workId` |
| 用途 | ポイント付与・消費の履歴 |
| 作成箇所 | `src/contexts/DataContext.jsx`, `src/pages/CustomerDetail.jsx` |
| 更新箇所 | コード上では確認できません |
| 削除箇所 | コード上では確認できません |
| 読み取り箇所 | `src/contexts/DataContext.jsx` |

読み取り:

- `onSnapshot(collection(db, 'transactions'))`

作成箇所:

- 制作実績作成時のポイント消費: `src/contexts/DataContext.jsx`
- 月次ポイント付与: `src/pages/CustomerDetail.jsx`
- 手動ポイント調整: `src/pages/CustomerDetail.jsx`

作成時に確認できるフィールド:

- `customerId`
- `type`
- `description`
- `points`
- `date`
- `workId`

## worksCatalog

| 項目 | 内容 |
| --- | --- |
| コレクション名 | `worksCatalog` |
| 主なフィールド | `name`, `category`, `points`, `notes`, `createdAt`, `updatedAt` |
| 用途 | 制作物マスタ |
| 作成箇所 | `src/pages/WorksCatalog.jsx` |
| 更新箇所 | `src/pages/WorksCatalog.jsx` |
| 削除箇所 | `src/pages/WorksCatalog.jsx` |
| 読み取り箇所 | `src/contexts/DataContext.jsx` |

読み取り:

- `onSnapshot(collection(db, 'worksCatalog'))`

作成時のフィールド:

- `name`
- `category`
- `points`
- `notes`
- `updatedAt`
- `createdAt`

更新時のフィールド:

- `name`
- `category`
- `points`
- `notes`
- `updatedAt`

