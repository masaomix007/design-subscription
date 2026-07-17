# AGENTS.md

## プロジェクト概要

本プロジェクトは、デザインサブスクリプションサービスの顧客・契約・制作実績を管理するWebアプリケーションです。

* フロントエンド：React + Vite
* バックエンド：Cloud Firestore
* 認証：Firebase Authentication
* 公開先：さくらのレンタルサーバー

Firebase Studioは現在使用しません。
Firebaseはバックエンドサービス（Firestore / Authentication）のみ利用します。

---

# ドキュメント

## プロジェクト資料

コードから確認できる内容は `docs/` を参照してください。

主なドキュメント

* docs/architecture.md
* docs/firestore-schema.md
* docs/authentication.md
* docs/deployment.md
* docs/development.md
* docs/issues.md

---

## Obsidian

仕様や背景はObsidianを参照してください。

通常は以下を最初に確認してください。

* Profile.md
* Mistakes.md

仕様や背景が必要な場合のみ

* Projects/<ProjectName>.md

を参照してください。

---

# 作業開始時

コードを変更する前に、以下を簡潔に報告してください。

* 変更対象ファイル
* 変更理由
* 影響範囲

3〜10行程度で十分です。

実装方針に問題がなければコード変更を開始してください。

---

# 作業ルール

* 関連コードを十分に調査してから修正する
* 推測だけで実装しない
* 不明点は選択肢を提示して確認する
* 1つのIssueにつき1つの修正を基本とする
* 大規模な変更は段階的に実施する
* 既存機能を独断で削除しない
* Firestoreコレクション名を独断で変更しない
* Firebase Authenticationの仕様を独断で変更しない
* Firestore Rulesへ影響する変更は明示する
* Firebase Hosting前提の実装を追加しない

---

# 実装後

作業終了時に以下を報告してください。

* 変更したファイル一覧
* 変更内容の要約
* 影響範囲
* 残課題（あれば）

可能な限り以下を実行してください。

* npm run build
* npm run lint

失敗した場合は原因も報告してください。

---

# コーディング方針

* 既存の設計・命名規則に合わせる
* 不要なリファクタリングは行わない
* コメントは必要最小限
* 保守性・可読性を優先する
* エラーは握りつぶさず、原因が分かる形で扱う

---

# Firestore

現在利用している主なコレクション

* users
* customers
* plans
* works
* transactions
* worksCatalog

スキーマは docs/firestore-schema.md を参照してください。

---

# 認証

* メールアドレス／パスワード認証
* 権限は users/{uid}.role により判定

詳細は docs/authentication.md を参照してください。

---

# デプロイ

* 開発：npm run dev
* ビルド：npm run build
* プレビュー：npm run preview

デプロイ方法は docs/deployment.md を参照してください。

---

# 注意事項

以下は変更時に特に注意してください。

* 認証処理
* 権限制御
* Firestore Rulesとの整合性
* データ構造の変更
* 顧客データへの影響

データ破壊につながる可能性がある変更は、実装前に必ず説明してください。

## External Knowledge

本プロジェクトでは、必要に応じて以下のObsidian資料も参照してください。

- Profile.md
- Mistakes.md
- Projects/<ProjectName>.md

これらはプロジェクト外のファイルであり、必要に応じてユーザーから参照を指示されます。