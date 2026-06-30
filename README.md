# ppt-ai-work — セマンティック・スロット方式のスライド生成

## 概要

本リポジトリは、**スライドの中身（content）を宣言データとして書き、レンダラがレイアウト・装飾（presentation）を一手に引き受ける**構成のスライド生成基盤である。

主な用途は、生成 AI に「情報源と粒度の指示」を与えて `deck.js` を生成させ、それを汎用レンダラで `.pptx` に変換することである。AI は pptxgenjs API や座標計算を一切知らずに済み、視覚仕様の変更はレンダラ側に閉じる。

このドキュメントは **AI が読んで `deck.js` を書く** ための仕様書を兼ねる。

## ワークフロー

```
情報源 (md, ヒアリングメモ, 既存資料)
        │
        │  + プロンプト（粒度・トーン・対象オーディエンス等）
        ▼
   生成 AI が deck.js を出力 ── 本ファイルで定義された kind 語彙を使う
        │
        ▼
   node renderer.js deck.js out.pptx
        │
        ▼
   out.pptx
```

AI に期待することは「資料の中身を `kind` + データに正しく落とすこと」のみである。座標計算・色決定・カード配置・図形描画はレンダラの責任で、AI が触ってはいけない。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `renderer.js` | 汎用レンダラ。`deck.js` を読み込み、各 slide を kind で dispatch して `.pptx` を生成する |
| `slide-kit.js` | レイアウト定数（色・余白・行送り等）と低レベル描画ヘルパー |
| `deck.example.js` | 全 kind を網羅するサンプル deck。書き方のリファレンスとしても使う |
| `make-pptx.js` | 旧構成（参考実装）。新規生成では使わない |

## 実行

```
node renderer.js <deck.js のパス> <出力 .pptx のパス>
```

例:

```
node renderer.js deck.example.js out.pptx
```

## deck.js の全体スキーマ

`deck.js` は CommonJS で次の構造をエクスポートする。

```js
module.exports = {
  meta: {
    title: string,        // pptx ファイルプロパティのタイトル
    eyebrow?: string,     // title-slide 上部の小見出し
    heading: string,      // title-slide の主見出し（\n で改行可）
    subtitle?: string,    // title-slide のサブタイトル
    meta?: string,        // title-slide 下部のメタ情報（作成日等）
  },
  sections: {
    // section キー → footer に表示するセクションラベル
    // 各 slide の spec.section はこのキーを参照する
    [key: string]: string,
  },
  slides: [
    // 各 slide は { kind, ... } の宣言データ
    // kind 一覧は本ドキュメント末尾参照
  ],
};
```

### footer の自動付与

各 slide には自動的に footer（左にセクション名、右にページ番号）が付与される。
振る舞いは次のとおり。

- `kind: "title-slide"`: footer を描画しない
- `kind: "section-divider"`: ページ番号のみ描画（セクション名なし）
- それ以外: `deck.sections[spec.section]` が表示される。`section` が未設定または存在しない場合は `要確認` が表示される（バグの早期発見用）

## kind 一覧

12 種類の kind を提供する。**用途で「これ」というものが無い場合は、最も近い既存 kind を選び、必要なら新 kind を renderer 側に追加する**こと（AI が自由に新しい kind を発明してはいけない。レンダラ未対応 kind は `要確認` のプレースホルダで描画される）。

### 構造系

| kind | 用途 |
|---|---|
| [`title-slide`](#title-slide) | 表紙 |
| [`section-divider`](#section-divider) | 章扉 |

### テキスト系

| kind | 用途 |
|---|---|
| [`bullets`](#bullets) | 全幅の箇条書きのみ |
| [`key-takeaway`](#key-takeaway) | ひと言の結論を中央に大きく |
| [`data-table`](#data-table) | 表形式データ |

### 比較系

| kind | 用途 |
|---|---|
| [`comparison-2`](#comparison-2) | 2 主体の対比 |
| [`trio`](#trio) | 3 並列のカード（トレンド・観点等） |

### 写真系

| kind | 用途 |
|---|---|
| [`photo-card`](#photo-card) | 事例紹介などで、右に写真・左に箇条書きカードを並べる |

### 図形系

| kind | 用途 |
|---|---|
| [`flow-diagram`](#flow-diagram) | A → B → C の直列フロー |
| [`process-stages`](#process-stages) | 番号付き工程 |
| [`matrix-2x2`](#matrix-2x2) | 2 軸 4 象限分類 |
| [`pyramid`](#pyramid) | 階層・優先度 |

> 循環プロセスの kind（`cycle`）は描画品質が pptxgenjs の図形プリミティブの制約で安定しなかったため、本バージョンでは未提供。必要な場合は `flow-diagram` または `process-stages` で代替する。

## kind を選ぶ判断ガイド

「文字を箇条書きで並べる」より図形にした方が伝わるケースを見落とさないこと。次の判定を必ず適用する。

| 内容の性質 | 推奨 kind |
|---|---|
| 単に列挙する事実 | `bullets` |
| 一文の結論を強調したい | `key-takeaway` |
| 数値や属性の比較 | `data-table` |
| 2 つの主体（案 / 部署 / 競合等）の対比 | `comparison-2` |
| 3 つの並列観点 | `trio` |
| 事例紹介で写真とテキストを同列に並べたい | `photo-card` |
| **時系列・手順・依存関係（順序が意味を持つ）** | `flow-diagram` / `process-stages` |
| **2 軸で分類できる項目群** | `matrix-2x2` |
| **抽象度・優先度の階層** | `pyramid` |

**警告サイン: 1 つの箇条書きアイテムが 30 文字を超えてくる / アイテム数が 7 個以上に膨らむ場合は、文字の構造化に失敗している可能性が高い。図形系 kind を再検討すること。**

---

## kind スキーマ詳細

### title-slide

表紙。`deck.meta` の内容を使うのでスライド側のフィールドは `kind` だけで足りる。

```js
{ kind: "title-slide" }
```

`deck.meta.heading` が主見出し、`eyebrow` / `subtitle` / `meta` がそれぞれ上部・下部の補助テキストになる。`heading` は `\n` を含めると複数行になる。

### section-divider

章の境目を示す扉ページ。

```js
{
  kind: "section-divider",
  label: "Section 1",          // 上に小さく表示
  title: "市場の全体像と参入余地",  // 中央に大きく表示
}
```

### bullets

全幅の箇条書きのみのスライド。

```js
{
  kind: "bullets",
  section: "market",                // sections のキー
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  items: [
    "1 行の主張をそのまま列挙する",
    "5〜7 項目以内に収める",
    ...
  ],
}
```

**制約**

- `items` が 7 件を超える、または 1 件 30 文字超のものが複数ある場合は kind を見直すこと
- 順序の意味が強い場合は `process-stages` の方が適している

### key-takeaway

「これだけ持ち帰って欲しい」を中央に大きく強調する。

```js
{
  kind: "key-takeaway",
  section: "conclusion",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  takeaway: "中央に大きく表示する一文（\\n で改行可）",
  supporting: [                     // 省略可
    "補足箇条書き 1",
    "補足箇条書き 2",
  ],
}
```

**用途**

- セクションの結論 / 提案の要点 / プレゼンの 1 行サマリー
- 長文を `takeaway` に詰め込むのは禁則。30〜60 文字程度を目安とする

### data-table

タイトル + 表 + 任意の注記。

```js
{
  kind: "data-table",
  section: "market",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  header: ["列名 1", "列名 2", ...],
  rows: [
    ["セル", "セル", ...],
    ...
  ],
  colW: [3.2, 2.8, ...],           // 列幅 (inch)。合計が CONTENT_W (12.033) を超えないこと
  rowH: 0.65,                      // 行高 (inch)
  fontSize: 11,                     // 省略可。既定 11pt
  note: {                           // 省略可
    text: "※ ...",
    style: "small" | "medium",      // 既定 medium (11pt)。small は 10pt
    gap: 0.25,                      // テーブル下端からの余白 (inch)、既定 0.25
  },
}
```

**列幅の決め方**

- 内容領域の合計幅は `CONTENT_W = 12.033 in` （= 13.333 - 0.65 * 2）
- 文字数が多い列を広めに、短い列を狭めに割り当てる
- 全列等幅でも問題ない場合は `CONTENT_W / 列数` を各列に与える

### comparison-2

左右に 2 主体を並べて対比する。

```js
{
  kind: "comparison-2",
  section: "compare",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  left: {
    title: "主体 A の名前",
    body: ["箇条書き 1", "箇条書き 2"] | "本文（文字列も可）",
    variant: "neutral" | "pos" | "neg" | "accent",  // 省略時 neutral
  },
  right: { /* 同上 */ },
}
```

**variant の選び方**

| variant | 色味 | 使い所 |
|---|---|---|
| `neutral` | 既定の薄グレー（タイトルだけアクセント色） | comparison-2 でどちらも中立に並べる既定 |
| `gray` | 完全グレー（タイトルも本文色） | 並列観点をフラットに見せる（trio の既定） |
| `pos` | 緑系 | 良い面・成功例・推奨案 |
| `neg` | 赤系 | 懸念・失敗例・避けるべき案・危険 |
| `accent` | 青系（プライマリ強調） | 結論・推奨方向・本命 |

**カード高の上限**

- カード幅: 約 5.87 in
- 1 カードあたり bullet 件数: **8 件まで**（推奨 4〜6 件）
- 1 bullet あたり文字数: 全角換算 **29 文字まで**（超えると 2 行折り返しで高さが倍化する）
- 上限を超えそうな場合は、bullet を短縮する／ `data-table` 等の別 kind に変える／スライドを分割する のいずれかで対応する。カードが contentH を超えるとフッターに重なる

### trio

3 つの並列ポイントを並べる。

```js
{
  kind: "trio",
  section: "intro",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  cards: [
    { title: "観点 1", body: [...] | "...", variant: "..." },
    { title: "観点 2", body: [...] | "...", variant: "..." },
    { title: "観点 3", body: [...] | "...", variant: "..." },
  ],
}
```

**配色の運用ルール（重要）**

- **既定は全カード `gray`**（variant 未指定で全カードがフラットなグレーになる）
- **内容が全部同列（並列観点）の場合**: variant を指定しない（→ 自動的に全グレー）
- **3 枚目で結論や強調をしたい場合**: 最右カードにのみ `variant` を指定する
  - `accent` (青): 推奨案・本命・普通の結論
  - `pos` (緑): 良い結論・推奨方向
  - `neg` (赤): 危険・避けるべき結論
- 中央や左のカードに variant を指定するのは、視線の流れが乱れるため非推奨

**制約**

- 必ず 3 件。4 件以上に増やしたくなった場合は `data-table` か別構成を検討
- 全カードで強調色を併用する（例: pos / neg / accent を 3 枚に分散）のは、視覚ノイズが多くなるため非推奨。色を使うなら最右の 1 枚に絞る

**カード高の上限**

- カード幅: 約 3.92 in（comparison-2 より狭い）
- 1 カードあたり bullet 件数: **8 件まで**（推奨 4〜6 件）
- 1 bullet あたり文字数: 全角換算 **17 文字まで**（超えると 2 行折り返しで高さが倍化する）
- 件数上限は comparison-2 と同じ（カード高はカード幅に依存しない）。差が出るのは「1 bullet が 1 行で収まる文字数」で、trio はカードが狭い分シビア
- 上限を超えそうな場合は、bullet を短縮する／別 kind（`bullets` で一覧化、`data-table` で構造化 等）に変える／観点を絞る のいずれかで対応する

### photo-card

事例紹介などで、右に写真・左に箇条書きカードを並べるレイアウト。

```js
{
  kind: "photo-card",
  section: "case",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  card: {
    title: "カード見出し",
    body: ["箇条書き 1", "箇条書き 2"] | "本文（文字列も可）",
    variant: "neutral" | "gray" | "pos" | "neg" | "accent",  // 省略時 neutral
  },
  image: {
    src: "assets/samples/case-1.png",   // deck.js のあるディレクトリからの相対パス（絶対パスも可）
  },
}
```

**レイアウト**

- 幅比は写真 : カード = **6 : 4**（カード幅 ≈ 4.30 in、写真エリア幅 ≈ 6.45 in、間に gap ≈ 0.48 in）
- カード/写真の幅と高さは contentW × contentH の 92% を基準に算出し、エリアはコンテンツ領域内で水平・垂直とも中央配置する（タイトル/メッセージとの間延びを抑えるため）
- gap はカード/写真幅とは独立に調整される。広げるとエリア全体は横方向に伸び、中央配置のためカードと写真は左右に少し開く
- カードと写真は同じ高さで上端揃えで配置する
- 写真は `sizing: contain` で枠内中央に配置される。**4:3 のアスペクト比を想定**しており、エリア比 (≈1.45) との差分で左右にわずかな余白が出る
- 4:3 から大きく外れる画像（極端な縦長・横長）を渡すとエリア内の余白が目立つ。レイアウトを優先する場合は事前にトリミングするか、別 kind を検討する

**カードの bullet 上限**

- 1 カードあたり bullet 件数: **8 件まで**（推奨 4〜6 件）
- 1 bullet あたり文字数: 全角換算 **20 文字まで**（comparison-2 の 29 字より厳しく、trio の 17 字より緩い）
- 件数上限を超えそうな場合は、bullet を短縮する／写真側に説明を寄せて bullet を絞る／別 kind に変える のいずれかで対応する

**画像ファイルの扱い**

- `image.src` は `deck.js` のあるディレクトリを基準とした相対パスで解決される（renderer 内部で `path.resolve(dirname(deckArg), src)`）
- 対応形式は pptxgenjs の `addImage` がそのまま扱うもの（PNG / JPEG / GIF）。SVG はサポートが弱いため事前に PNG 変換が必要
- AI は画像ファイル自体を用意できないため、運用上はユーザが画像を `assets/` 等に置いた上で、deck.js に相対パスを書く形になる

### flow-diagram

A → B → C の直列フロー。各ステップに短い説明を付ける。

```js
{
  kind: "flow-diagram",
  section: "diagram",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  steps: [
    { label: "ステップ名", description: "短い説明（省略可）" },
    ...
  ],
}
```

**制約**

- `steps.length` は **3〜5 推奨**、最大 6。それ以上は文字が小さくなりすぎる
- `description` は 1〜2 行に収まる長さ（〜40 文字目安）

### process-stages

順序のある工程列。番号バッジ付きで「ステップ感」を強調する。

```js
{
  kind: "process-stages",
  section: "diagram",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  stages: [
    { label: "段階名", description: "説明（省略可）" },
    ...
  ],
}
```

**`flow-diagram` との使い分け**

- `flow-diagram`: 状態間の遷移を強調（A → B）。プロセス図 / データフロー向き
- `process-stages`: 順序とフェーズ感を強調（第 1 段階 / 第 2 段階）。プロジェクト工程向き

### matrix-2x2

2 軸で 4 象限に分類する。

```js
{
  kind: "matrix-2x2",
  section: "diagram",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  xAxis: { low: "左端ラベル", high: "右端ラベル" },
  yAxis: { high: "上端ラベル", low: "下端ラベル" },
  quadrants: {
    topLeft:     { title: "象限名", body: "本文" | [...] },
    topRight:    { title: "象限名", body: "..." },
    bottomLeft:  { title: "象限名", body: "..." },
    bottomRight: { title: "象限名", body: "..." },
  },
}
```

**注意**

- 軸の向きは慣習に従う:
  - X 軸: 左が低い / 右が高い
  - Y 軸: 上が高い / 下が低い
- 4 象限すべてに何か書くこと（空欄は不可）

### pyramid

階層・優先度を視覚化する。

```js
{
  kind: "pyramid",
  section: "diagram",
  title: "スライドタイトル",
  message: "サブメッセージ（省略可）",
  layout: "centered" | "side",   // 省略時 "centered"
  tiers: [
    { label: "頂点に近い層", description: "説明（省略可）" },
    ...
    { label: "底辺の層", description: "..." },
  ],
}
```

**layout の選び方**

| layout | 構成 | 適合する場面 |
|---|---|---|
| `centered`（既定） | ピラミッドを中央配置。各層内に label + 短い説明をインライン表示 | 説明文が短い（〜25 文字程度）。階層感を最も強く出したい |
| `side` | ピラミッドを左寄せ。説明文を右側に並べる | 説明文が長く、ピラミッド内に収めると窮屈な場合 |

**制約**

- `tiers[0]` が頂点（最も狭い層）、配列末尾が底辺（最も広い層）
- `tiers.length` は **3〜5 推奨**
- 「上が重要」「上が抽象度が高い」「上が優先順位が高い」など、視覚的な上下関係に意味があるときに使う
- `centered` で description が長すぎると最上段（最も狭い層）で折り返してオーバーフローする。長文を載せたい場合は `side` を選ぶ

---

## 図形系 kind の共通制約

- pptxgenjs の図形プリミティブ（矩形・円・矢印等）に限定して描画する。フリーフォームのスケッチ、複雑なネットワーク図、地図系は不可
- 1 図あたりの要素数は **15 個程度が上限**。それを超えると視認性が崩れる
- 図形 kind は「視覚化が情報伝達に勝る」場合にのみ選ぶ。単に箇条書きを図にしただけのものは、結果として情報密度が下がるため避ける

## 表記ガイド

- 各 slide の `title` は 1 行で 30〜50 文字程度に収める
- `message` は 1〜2 行で本スライドの主張を要約する。なくても良い
- 数字や英数字は半角、全角句読点・記号は資料全体で統一すること

## レンダラ未対応 kind の扱い

宣言データに未知の `kind` を書いた場合、レンダラはそのスライドを `未実装の kind: <name>` と表示する。AI は新しい kind を発明してはならない。新たなレイアウトが必要になった場合は、人間が `renderer.js` にハンドラを追加し、本ドキュメントに節を追加してから使えるようになる。
