# Authentication

## 目次

- [認証方式](#認証方式)
- [ログイン処理](#ログイン処理)
- [ログアウト処理](#ログアウト処理)
- [usersコレクションとの関係](#usersコレクションとの関係)
- [roleの管理方法](#roleの管理方法)
- [ProtectedRoute](#protectedroute)
- [AdminRoute](#adminroute)
- [権限制御](#権限制御)
- [現状の問題点](#現状の問題点)
- [Firestore Rulesで確認すべき事項](#firestore-rulesで確認すべき事項)

## 認証方式

Firebase Authenticationのメールアドレス/パスワード認証を使用しています。

使用箇所:

- `src/pages/Login.jsx`
- `src/components/Layout.jsx`
- `src/contexts/DataContext.jsx`
- `src/firebase.js`

## ログイン処理

`src/pages/Login.jsx` で `signInWithEmailAndPassword(auth, email, password)` を実行します。

ログイン後の遷移は `useEffect` で制御されています。

| 条件 | 遷移先 |
| --- | --- |
| `user.role === 'admin'` | `/dashboard` |
| `user.role === 'customer'` かつ `currentUserCustomer` がある | `/customers/{currentUserCustomer.id}` |
| それ以外 | `/dashboard` |

## ログアウト処理

`src/components/Layout.jsx` で `signOut(auth)` を実行します。

ログアウト成功後は `/login` へ遷移します。

## usersコレクションとの関係

`src/contexts/DataContext.jsx` でFirebase Authのログイン状態を監視しています。

ログインユーザーが存在する場合、Firestoreの `users/{uid}` を読み取ります。

```text
users/{Firebase Auth UID}
```

`users/{uid}` が存在する場合は、Firebase Authユーザー情報にFirestoreドキュメントのデータを統合して `user` として保持します。

`users/{uid}` が存在しない場合は、`role: 'customer'` が設定されます。

## roleの管理方法

コードから確認できる `role` は以下です。

| role | 用途 |
| --- | --- |
| `admin` | 管理者 |
| `customer` | 顧客 |

`role` の作成・更新処理はコード上では確認できません。

## ProtectedRoute

`src/App.jsx` に定義されています。

役割:

- `authLoading` 中はローディング表示
- `user` が存在しない場合は `/login` へリダイレクト
- `user` が存在する場合は `Layout` でラップして子ルートを表示

## AdminRoute

`src/App.jsx` に定義されています。

役割:

- `loading` 中はローディング表示
- `user?.role !== 'admin'` の場合は `/dashboard` へリダイレクト
- `admin` の場合のみ子コンポーネントを表示

AdminRoute配下のルート:

| ルート | コンポーネント |
| --- | --- |
| `/customers` | `CustomerList.jsx` |
| `/plans` | `PlanList.jsx` |
| `/works-catalog` | `WorksCatalog.jsx` |

## 権限制御

コード上の権限制御は主に画面ルーティングと表示制御で行われています。

| 対象 | 制御内容 |
| --- | --- |
| `/login` | 未認証でも表示 |
| `/dashboard` | 認証済みユーザーのみ |
| `/customers/:id` | 認証済みユーザーのみ |
| `/customers` | 管理者のみ |
| `/plans` | 管理者のみ |
| `/works-catalog` | 管理者のみ |
| サイドメニュー | `user.role` と `currentUserCustomer` に応じて表示項目を切り替え |
| 顧客詳細の管理操作 | `user.role === 'admin'` の場合のみ一部ボタンを表示 |

## 現状の問題点

| 問題 | 内容 | 関連ファイル |
| --- | --- | --- |
| ログイン後にローディングから抜けない可能性 | `isLoggingIn` がログイン成功後に `false` に戻されず、リダイレクト処理がreturnする可能性があります | `src/pages/Login.jsx` |
| 顧客詳細の本人チェック不足 | `/customers/:id` は `ProtectedRoute` のみで、顧客本人のIDかどうかを画面側で検証していません | `src/App.jsx`, `src/pages/CustomerDetail.jsx` |
| `role` の管理画面がない | `users/{uid}.role` の作成・更新処理はコード上で確認できません | `src/contexts/DataContext.jsx` |
| Firestore Rulesが未確認 | リポジトリ内にFirestore Rulesファイルが見当たりません | 要確認 |

## Firestore Rulesで確認すべき事項

以下はコードからは確認できないため、Firebase ConsoleまたはRulesファイルで要確認です。

| 項目 | 確認内容 |
| --- | --- |
| `users` | ログインユーザーが自分以外の `role` を変更できないこと |
| `customers` | 顧客ユーザーが他顧客のデータを読めないこと |
| `plans` | 顧客ユーザーの書き込みが禁止されていること |
| `works` | 顧客ユーザーが他顧客の制作実績を読めないこと |
| `transactions` | 顧客ユーザーが他顧客の取引履歴を読めないこと |
| `worksCatalog` | 削除が管理者に許可されていること |
| 管理者判定 | Rules側でも `users/{uid}.role == 'admin'` 相当の判定があること |

