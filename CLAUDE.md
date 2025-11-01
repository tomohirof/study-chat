# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ChatGPTを利用した学習モード用のProgressive Web App（PWA）です。OpenAI APIと連携してチャット機能を提供し、会話履歴をlocalStorageに保存します。

### 技術スタック

- **フレームワーク**: React 19 + Vite 7
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4 (Plume Design System)
- **テスト**: Vitest + React Testing Library
- **API**: OpenAI Chat Completions API

## 開発コマンド

### 開発サーバー起動
```bash
npm run dev
```
http://localhost:1031 で開発サーバーが起動します。

### テスト実行
```bash
npm test              # テスト実行（watch mode）
npm run test:ui       # UIでテスト実行
npm run test:coverage # カバレッジレポート生成
```

### ビルド
```bash
npm run build         # 本番ビルド
npm run preview       # ビルド結果のプレビュー
```

## アーキテクチャ

### ディレクトリ構成

```
src/
├── api/                      # API層
│   ├── ChatApiClient.ts     # OpenAI API呼び出し
│   └── types.ts             # API型定義
├── services/                # ビジネスロジック層
│   ├── ChatHistoryService.ts # 履歴管理サービス
│   └── types.ts             # サービス型定義
├── storage/                 # ストレージ層
│   └── StorageRepository.ts # localStorage抽象化
├── components/              # UIコンポーネント
│   ├── ui/                  # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── ChatMessage.tsx      # メッセージ表示
│   └── ChatInput.tsx        # メッセージ入力
├── pages/                   # ページコンポーネント
│   └── chat/
│       └── ChatPage.tsx     # メインチャット画面
├── lib/
│   ├── utils.ts             # ユーティリティ関数
│   └── imageUtils.ts        # 画像処理ユーティリティ
└── test/
    └── setup.ts             # テストセットアップ

tests/
├── unit/                    # ユニットテスト
│   ├── api/
│   ├── services/
│   └── storage/
└── integration/             # 統合テスト
    └── pages/
```

### レイヤー構成

1. **API層** (`src/api/`)
   - OpenAI APIとの通信を担当
   - `ChatApiClient`: API呼び出しとエラーハンドリング

2. **サービス層** (`src/services/`)
   - ビジネスロジックを担当
   - `ChatHistoryService`: 履歴の保存・取得・削除

3. **ストレージ層** (`src/storage/`)
   - データ永続化を担当
   - `StorageRepository`: localStorageの抽象化（将来的にバックエンドAPI対応予定）

4. **UI層** (`src/components/`, `src/pages/`)
   - ユーザーインターフェース
   - Plume Design Systemに基づくコンポーネント

## 環境設定

### 環境変数

`.env`ファイルを作成し、以下の変数を設定：

```bash
# 必須
VITE_OPENAI_API_KEY=your_openai_api_key_here

# オプション
VITE_OPENAI_API_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

`.env.example`を参考にしてください。

## テスト方針

### TDD（テスト駆動開発）

このプロジェクトはTDDで開発されています：

1. **テストを先に書く** - 新機能の前にテストを作成
2. **実装** - テストが通るように実装
3. **リファクタリング** - テストが通ったままコードを改善

### テストの粒度

- **ユニットテスト**: API、サービス、ストレージの純粋ロジック
- **統合テスト**: ページ単位の重要なフロー
- **モック**: OpenAI APIは`vi.mock()`でモック化

### 実行例

```bash
# 特定のファイルをテスト
npm test -- tests/unit/api/ChatApiClient.test.ts

# カバレッジ確認
npm run test:coverage
```

## スタイリング

### Tailwind CSS 4 + Plume Design System

- `@import "tailwindcss"`で読み込み
- `@theme`ディレクティブでカスタムカラー定義
- カラーパレット: primary, secondary, muted, destructive等
- `cn()`ユーティリティ関数でクラス名を条件付き結合

### カスタムカラー

`src/index.css`の`@theme`ブロックで定義：
- `--color-primary`: メインカラー（青）
- `--color-destructive`: エラー・削除用（赤）
- `--color-muted`: 控えめな背景・テキスト

## 主要機能

### チャット機能

- OpenAI APIとの会話（テキスト・画像対応）
- **画像添付機能**（📎ボタン）
  - JPEG, PNG, GIF, WebP対応
  - 最大20MBまで
  - Base64エンコードで送信
  - GPT-4 Vision対応（自動モデル切り替え）
- リアルタイムメッセージ表示
- 画像プレビュー機能
- ローディング状態の表示
- エラーハンドリング

### 履歴管理

- localStorageに自動保存（画像含む）
- 履歴の表示
- 履歴のクリア機能

### APIキー管理

- 環境変数でAPIキーを管理
- APIキー未設定時の警告表示

## トラブルシューティング

### ビルドエラー

1. **Tailwind CSS関連**: `@tailwindcss/postcss`がインストールされているか確認
2. **型エラー**: `src/vite-env.d.ts`で環境変数の型定義を確認

### テスト失敗

- `beforeEach`で`localStorage.clear()`を呼んでいるか確認
- モックが正しく設定されているか確認

### APIエラー

- `.env`ファイルにAPIキーが設定されているか確認
- APIキーが有効か、クォータが残っているか確認

## 今後の拡張予定

- [ ] ログイン機能の実装
- [ ] 復習機能（review.html）の実装
- [ ] バックエンドAPIの追加（履歴の永続化）
- [ ] Service Workerの更新（新しいビルド成果物に対応）
- [ ] PWA manifest の更新
