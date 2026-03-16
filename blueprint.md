# ポイント管理システム MVP 設計書

## 1. 概要

本ドキュメントは、ポイント制サブスクリプションサービスのための顧客管理・ポイント管理MVP（Minimum Viable Product）の設計と実装計画を定義する。「一つのデータ（案件）を作れば、進行管理も実績公開も同時にできる」ことを目指す。

## 2. 機能要件

### 2.1. データモデル

-   **顧客 (Customer)**
    -   `id`: 一意の識別子 (UUID)
    -   `name`: 顧客名
    -   `contactName`: 担当者名
    -   `email`: メールアドレス
    -   `memo`: メモ
    -   `planId`: 適用されているプランのID (Nullable)
-   **案件 (Task)** (各顧客ドキュメントのサブコレクション)
    -   `id`: 一意の識別子 (UUID)
    -   `name`: 案件名（制作物名）
    -   `status`: ステータス (`対応中`, `完了`)
    -   `dueDate`: 完了予定日 (Date)
    -   `deliveryUrl`: 納品URL (string)
    -   `notes`: 備考 (string)
    -   `pointsUsed`: 消費ポイント (number)
    -   `category`: カテゴリ (string, e.g., "Web", "バナー")
    -   `imageUrl`: 実績公開用の画像URL (string)
    -   `completedAt`: 完了日 (Date) - ステータスが「完了」になった日時
-   **ポイント取引 (Transaction)**
    -   `id`: 一意の識別子 (UUID)
    -   `customerId`: 関連する顧客のID
    -   `date`: 取引日 (ISO 8601 形式)
    -   `type`: 種別 (`grant`, `consume`, `adjust`, `work`)
    -   `points`: ポイント数 (付与/調整は正、消費は負)
    -   `memo`: メモ（案件名など）
-   **プラン (Plan)**
    -   `id`: 一意の識別子 (UUID)
    -   `name`: プラン名
    -   `monthlyPoints`: 月額ポイント付与数 (number)
    -   `canCarryOver`: 繰越可否 (boolean)
    -   `notes`: 備考

### 2.2. 画面構成と機能

-   **ダッシュボード (`/`)**
-   **プラン管理 (`/plans`)**
-   **制作実績一覧 (`/works`)**
    -   全顧客の`tasks`の中から、`status`が`完了`のものを`collectionGroup`で取得して一覧表示する。
-   **顧客一覧 (`/customers`)**
-   **顧客詳細 (`/customers/:id`)**
    -   **作業状況リスト:**
        -   管理者: 案件の新規追加・編集・削除機能（これが唯一の入力口）
        -   案件追加/編集時に消費ポイントも入力させる。
        -   案件が保存されると、自動的にポイントが消費され、取引履歴に記録される。
        -   顧客: 自身の案件リストの閲覧機能
        -   ステータスが「完了」かつ納品URLが存在する場合に「納品物をダウンロード」ボタンを表示
        -   `onSnapshot`によるリアルタイム更新
    -   **ポイント取引履歴:**
        -   会計的なポイントの動き（付与、消費、案件利用など）の全ログを表示

## 3. 技術選定と実装方針

-   **DBクエリ:** Firestore `collectionGroup` を活用し、複数サブコレクションを横断したクエリを実行する。

## 4. 実装ステップ

1.  **データモデルの統合:**
    -   `blueprint.md`の`Task`モデルを更新し、`Work`モデルを廃止。
2.  **`DataContext`の改修:**
    -   古い`works`関連ロジックを削除。
    -   `addTask`と`updateTask`にポイント消費と取引履歴を記録するロジックを追加。
    -   `collectionGroup`を使い、全顧客の完了済み`tasks`を取得するリスナーを追加。
3.  **UIの整理と統合:**
    -   `CustomerDetail.jsx`から古い制作実績テーブルとフォームを削除。
    -   `TaskForm.jsx`に「消費ポイント」「カテゴリ」「画像URL」などの項目を追加。
4.  **制作実績ページの修正:**
    -   `Works.jsx`が新しいデータソース（完了済み`tasks`）を参照するように修正。
5.  **クリーンアップ:**
    -   不要になった`AddWorkForm.jsx`ファイルを削除。
