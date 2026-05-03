---
name: update-spec
description: コードベースの変更を分析し、対象アプリの SPEC.md を加筆・修正する。Use when the user asks to update the spec, reflect commits/changes in the spec, or keep SPEC.md in sync with the codebase.
---

# update-spec Skill

コードベースの変更を分析し、対象アプリの SPEC.md を加筆・修正する。

## 使い方

```
/update-spec blog     → apps/blog/SPEC.md を更新
/update-spec 3d       → apps/3d-world/SPEC.md を更新
```

引数が省略された場合は、どちらを対象にするか確認する。

## 対象パスの対応表

| 引数 | アプリ | SPECパス |
|------|--------|----------|
| `blog` | ブログフロントエンド | `apps/blog/SPEC.md` |
| `3d` | 3Dワールド | `apps/3d-world/SPEC.md` |

## ワークフロー

1. **変更の把握**: 対象アプリのソースコード（components, lib, hooks, routes, package.json）とディレクトリ構成を読み、SPEC と比較する
2. **差分の特定**: 新規ファイル、削除、Props/依存の変更、設定値の変更、アルゴリズムの変更を洗い出す
3. **該当セクションの更新**: 以下に従い SPEC を修正する

## SPEC の構成と更新マッピング

| 変更の種類 | 更新するセクション |
|------------|-------------------|
| 新規コンポーネント | コンポーネント詳細、ディレクトリ構成、アーキテクチャ図 |
| コンポーネントの責務・Props・依存の変更 | コンポーネント詳細 |
| 新規/変更された設定 | 設定リファレンス |
| 新規ファイル・ディレクトリ | ディレクトリ構成 |
| 新規/変更された依存（package.json） | 技術スタック |
| データの流れの変更 | データフロー |
| 実装済みの拡張 | 今後の拡張（[ ]→[x]） |
| 新たな注意・トラブル | 開発ガイド・トラブルシューティング |

## 実施時のポイント

- **一貫性**: ファイル名・コンポーネント名はコードと一致させる
- **日本語**: SPEC は日本語で記述する
- **差分のみ**: 変更のないセクションは触れない
- **SPEC がなければ新規作成**: 対象の SPEC.md が存在しない場合は現状のコードベースを元に作成する
