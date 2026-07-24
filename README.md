# ppt-ai-work

生成 AI に宣言データ（`deck.js`）を書かせ、レンダラで `.pptx` に変換するスライド生成リポジトリ。

## ディレクトリ構成

| パス | 役割 |
|---|---|
| `deckgen/` | 全発表共通のスライド生成基盤（engine / themes / kind 語彙仕様 / サンプル）。詳細は `deckgen/README.md` |
| `slides/<slug>/` | 発表ごとの成果物。アウトライン・deck ファイル・生成 `.pptx`・発表固有の画像アセットを 1 ディレクトリで管理する |
| `.claude/skills/make-slides/` | 情報源 → deck.js → .pptx の生成ワークフロー定義（Claude Code skill） |

## 使い方

deck.js のスキーマと kind 語彙は `deckgen/README.md` を参照する。レンダリングはリポジトリルートから実行する:

```
node deckgen/themes/<theme>/renderer.js slides/<slug>/deck-<slug>.js slides/<slug>/deck-<slug>.pptx
```

Claude Code からは make-slides skill（「スライド作って」等）で情報源ファイルからデッキを生成できる。成果物は `slides/<slug>/` 配下に書き出される。
