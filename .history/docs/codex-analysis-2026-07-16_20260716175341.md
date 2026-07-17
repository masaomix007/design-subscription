• 調査しました。コード変更はしていません。npm run lint だけ実行し、現状エラーありです。

  1. 技術スタック
  事実:
  React + Vite のSPAです。npm list --depth=0上の主な実バージョンは以下です。

  - Node.js v22.20.0
  - npm 10.9.3
  - React 19.2.3
  - React DOM 19.2.3
  - React Router DOM 7.10.1
  - Vite 7.3.0
  - Firebase SDK 12.8.0
  - MUI 7.3.6
  - MUI X Date Pickers 8.25.0
  - date-fns 4.1.0
  - notistack 3.0.2
  - ESLint 9.39.2

  引き継ぎ資料との差分:
  資料はReact v18 / React Router v6ですが、実コードはReact 19 / React Router 7です。

  2. ディレクトリ構成
  事実:

  .
  ├─ .idx/                  Firebase Studio / IDX設定
  ├─ .history/
  ├─ node_modules/
  ├─ public/
  ├─ src/
  │  ├─ assets/
  │  ├─ components/
  │  │  ├─ Layout.jsx
  │  │  ├─ TaskForm.jsx
  │  │  └─ TaskList.jsx
  │  ├─ contexts/
  │  │  └─ DataContext.jsx
  │  ├─ hooks/
  │  │  └─ useLocalStorage.js
  │  ├─ pages/
  │  │  ├─ CustomerDetail.jsx
  │  │  ├─ CustomerList.jsx
  │  │  ├─ Dashboard.jsx
  │  │  ├─ Login.jsx
  │  │  ├─ PlanList.jsx
  │  │  ├─ Works.jsx
  │  │  └─ WorksCatalog.jsx
  │  ├─ App.jsx
  │  ├─ firebase.js
  │  └─ main.jsx
  ├─ AGENTS.md              空ファイル
  ├─ GEMINI.md              Firebase Studio/Gemini向け指示
  ├─ blueprint.md
  ├─ package.json
  ├─ vite.config.js
  └─ README.md

  3. 起動・ビルドコマンド
  事実: /C:/dev/design-subscription/package.json:6

  - 開発: npm run dev
  - ビルド: npm run build
  - Lint: npm run lint
  - プレビュー: npm run preview

  4. Firebase初期化箇所
  事実: /C:/dev/design-subscription/src/firebase.js:5

  - initializeApp(firebaseConfig) は /C:/dev/design-subscription/src/firebase.js:14
  - Firestore export は /C:/dev/design-subscription/src/firebase.js:16
  - Auth export は /C:/dev/design-subscription/src/firebase.js:17
  - Firebase projectId は design-subscription-5675-d0f6d

  5. Firestoreコレクションと主要フィールド
  事実、コードから確認できるもの:

  - users: role。Auth UIDをドキュメントIDとして参照。/C:/dev/design-subscription/src/contexts/DataContext.jsx:27
  - customers: name, planId, email, contactName, memo, createdAt, updatedAt
  - plans: name, monthlyPoints, canCarryOver, notes, createdAt, updatedAt
  - works: customerId, clientId読み取り互換, name, category, pointsUsed, status, dateUsed, deliveryUrl, memo, createdAt, updatedAt
  - transactions: customerId, type, description, points, date, workId
  - worksCatalog: name, category, points, notes, createdAt, updatedAt

  6. Firestore CRUD箇所
  事実:

  - 読み取り:
      - users/{uid}: getDoc /C:/dev/design-subscription/src/contexts/DataContext.jsx:28
      - customers, plans, works, transactions, worksCatalog: onSnapshot /C:/dev/design-subscription/src/contexts/DataContext.jsx:59

  - 作成:
      - 顧客: /C:/dev/design-subscription/src/pages/CustomerList.jsx:74
      - プラン: /C:/dev/design-subscription/src/pages/PlanList.jsx:46
      - 制作物マスタ: /C:/dev/design-subscription/src/pages/WorksCatalog.jsx:48
      - 制作実績: /C:/dev/design-subscription/src/contexts/DataContext.jsx:119
      - ポイント取引: /C:/dev/design-subscription/src/contexts/DataContext.jsx:125, /C:/dev/design-subscription/src/pages/CustomerDetail.jsx:62

  - 更新:
      - 顧客: /C:/dev/design-subscription/src/pages/CustomerList.jsx:76
      - プラン: /C:/dev/design-subscription/src/pages/PlanList.jsx:48
      - 制作物マスタ: /C:/dev/design-subscription/src/pages/WorksCatalog.jsx:53
      - 制作実績: /C:/dev/design-subscription/src/contexts/DataContext.jsx:136

  - 削除:
      - 顧客: /C:/dev/design-subscription/src/pages/CustomerList.jsx:86
      - プラン: /C:/dev/design-subscription/src/pages/PlanList.jsx:57
      - 制作物マスタ: /C:/dev/design-subscription/src/pages/WorksCatalog.jsx:62
      - works と transactions の削除処理は実装なし。TaskListにはdeleteTask呼び出しがありますがContextに存在しません。

  7. Firebase Authentication
  事実:
  メールアドレス/パスワード認証です。signInWithEmailAndPassword を使用。/C:/dev/design-subscription/src/pages/Login.jsx:54

  ログアウトは signOut。/C:/dev/design-subscription/src/components/Layout.jsx:23

  8. 権限制御
  事実:
  Firestore users/{uid}.role が admin なら管理者、それ以外またはユーザードキュメントなしなら customer 扱いです。/C:/dev/design-subscription/src/contexts/DataContext.jsx:30

  管理者専用ルートは AdminRoute で制御されています。/C:/dev/design-subscription/src/App.jsx:29

  要注意:
  /customers/:id は ProtectedRouteのみで、顧客本人かどうかのチェックがありません。/C:/dev/design-subscription/src/App.jsx:58
  顧客が別顧客IDを知っている場合、画面上アクセスできる可能性があります。最終防衛はFirestore Security Rules次第ですが、ルールはリポジトリにありません。要確認です。

  9. ログイン後の画面遷移
  事実:
  管理者は /dashboard、顧客は対応する顧客が見つかれば /customers/{id} に遷移する意図です。/C:/dev/design-subscription/src/pages/Login.jsx:33

  ただし実装上の不具合候補:
  ログイン成功後に isLoggingIn を false に戻さないため、useEffect が isLoggingIn でreturnし、ローディングから抜けない可能性が高いです。/C:/dev/design-subscription/src/pages/
  Login.jsx:29, /C:/dev/design-subscription/src/pages/Login.jsx:56

  10. Firebase Studio固有設定
  事実:
  残っています。

  - .idx/dev.nix: Node.js 22、IDX preview、Gemini拡張設定
  - .idx/mcp.json: Firebase MCP設定
  - GEMINI.md: Firebase Studio/Gemini向け開発指示
  - README.md: Viteテンプレートのまま

  通常のVS Code + npm開発に必須ではなさそうです。

  11. さくらサーバーへの公開方法
  事実:
  さくら向けデプロイスクリプト、FTP/SSH設定、.htaccess は見当たりません。

  コードから確認できる公開前提:
  vite.config.js に base: './' があり、サブディレクトリ配置を意識した相対パス設定です。/C:/dev/design-subscription/vite.config.js:6

  推測:
  npm run build で生成される dist/ をさくらの公開ディレクトリへアップロードする運用になりそうです。ただし BrowserRouter 使用のため、直リンクやリロード対応にはさくら側でSPA fallback
  用の .htaccess が必要になる可能性があります。これは要確認です。

  12. 既知の不具合
  事実:

  - npm run lint が6件エラーで失敗。
      - 未使用import: query, orderBy
      - Fast Refresh警告
      - 未使用catch変数

  - ログイン成功後にローディング固定の可能性あり。
  - 制作実績編集が壊れている可能性あり。updateWork(workId, workData) 定義に対し、TaskFormは updateWork(customerId, task.id, payload) と3引数で呼んでいます。/C:/dev/design-
    subscription/src/components/TaskForm.jsx:84

  - TaskList.jsx は role, deleteTask, 配列としての tasks を期待しますが、Contextはそれらをその形で提供していません。/C:/dev/design-subscription/src/components/TaskList.jsx:29
  - Works.jsx は publishedWorks を期待しますが、Contextに存在しません。/C:/dev/design-subscription/src/pages/Works.jsx:17
  - 顧客詳細の本人チェック不足。

  13. 引き継ぎ資料との差分
  事実:

  - React v18 → 実際は React 19
  - React Router v6 → 実際は React Router 7
  - 資料では「初回ログイン時に /dashboard へ行く」とあるが、実コードではログイン後ローディング固定の可能性がある
  - 資料では制作物マスタ削除はFirestore Rules原因の可能性とあるが、コード上の削除処理自体は存在する。Rulesはリポジトリ外なので要確認
  - blueprint.mdでは案件は顧客サブコレクション想定ですが、実装はトップレベル works コレクションです

  14. AGENTS.mdに記載すべき内容の提案

  - Firebase Studioは今後使用しない。.idx/とGEMINI.mdは旧環境由来として扱う
  - コード変更前に npm run lint を確認し、既存Lintエラーを把握する
  - Firebase設定は /C:/dev/design-subscription/src/firebase.js:5
  - Firestoreはトップレベル customers/plans/works/transactions/worksCatalog/users
  - Authはメール/パスワード。権限は users/{uid}.role
  - 顧客本人アクセス制御は未完成のため、画面側とFirestore Rules両方で要確認
  - 公開はVite build成果物をさくらへ配置する方針。ただしSPA fallback設定は要確認
  - 作業時はFirebaseバックエンドを継続利用し、Firebase Hosting前提にしない
  - 既知不具合としてログイン遷移、制作実績編集、未使用/破損気味の TaskList.jsx / Works.jsx を明記する