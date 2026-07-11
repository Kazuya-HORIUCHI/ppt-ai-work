# アーキテクチャ設計書

本ドキュメントは ppt-ai-work の内部構造を説明する。対象読者は、エンジン・テーマを実装または拡張する人間および AI である。

`README.md` が「deck.js を書く側（主に生成 AI）向けの外部仕様」であるのに対し、本ドキュメントは「エンジン・テーマを実装する側向けの内部設計」を扱う。kind ごとのスキーマ・制約値は README.md を参照元とし、本ドキュメントでは重複記載しない。

## 1. 設計原則

本システムは「セマンティック・スロット方式」を採用する。中核となる原則は次の 3 つである。

1. **content と presentation の分離**: スライドの中身（何を伝えるか）は `deck.js` に宣言データとして書き、レイアウト・配色・図形描画（どう見せるか）はすべてテーマ側が決定する。deck.js には座標・色・フォントサイズを書かない（例外は `data-table` の列幅など、内容と不可分な寸法のみ）。
2. **AI の責務の限定**: 生成 AI の仕事は「情報源を kind + データに正しく落とすこと」だけである。AI は pptxgenjs API・座標計算・配色判断に関与せず、視覚仕様の変更はテーマ側のコード変更に閉じる。
3. **エンジンとテーマの分離**: テーマによらない処理（CLI、deck 読み込み、dispatch、footer ポリシー）は `core/` に一度だけ実装し、全テーマで共有する。見た目に関わるコードはすべて `themes/<name>/` に置き、**kind の視覚的実装はテーマ間で共有しない**（同じ kind でもテーマごとにレイアウトは別物になる前提）。

kind がテーマ間で共有するのは**データ構造（スキーマ）のみ**である。同一の deck.js を別テーマの renderer に渡せば、同じ意味構造が別の視覚表現で出力される。テーマが未サポートの kind はプレースホルダ描画にフォールバックする。

## 2. 全体構成

```
情報源 (md / メモ / 既存資料)
        │  make-slides skill（.claude/skills/make-slides/）
        ▼
   deck-<slug>.js               … 宣言データ。{ meta, sections, slides } を CommonJS export
        │
        │  node themes/<theme>/renderer.js deck-<slug>.js out.pptx
        ▼
   themes/<theme>/renderer.js   … CLI シム。engine に theme を渡すだけ
        ▼
   core/engine.js               … スライドループ・kind dispatch・footer ポリシー
        │  theme.kinds[kind] を lookup して呼び出す
        ▼
   themes/<theme>/kinds/<kind>.js … spec を解釈し配置を計算（テーマ固有）
        │  tokens（定数）と parts（描画パーツ）を利用
        ▼
   pptxgenjs → .pptx
```

### レイヤと依存方向

依存は一方向である: `deck.js`（データ）← `core/` ← `themes/<name>/`。core はテーマを知らず（引数で受け取るのみ）、テーマは core を import する。

| レイヤ | 知っていること | 知らないこと |
|---|---|---|
| deck.js | kind 語彙と各 kind のフィールド（README.md 準拠） | 座標・色・フォント・pptxgenjs |
| core/engine.js | deck の外形（meta / sections / slides / spec.kind）、footer ポリシー | kind の中身、見た目のすべて |
| core/text-metrics.js | 文字幅・折り返しの計算式 | フィッティング値（tokens 引数で受ける） |
| themes/<name>/kinds/ | spec の全フィールド、kind ごとの配置ロジック | 資料の中身 |
| themes/<name>/parts.js | このテーマの描画パーツと寸法計算 | deck.js の spec 構造、kind の存在 |
| themes/<name>/tokens.js | デザイントークン（値のみ） | ロジック全般 |

## 3. ファイル構成と責務

| パス | 責務 |
|---|---|
| `README.md` | deck.js の外部仕様書。kind 一覧・スキーマ・選定ガイド・制約値。**AI が deck.js を書くときの参照元** |
| `docs/architecture.md` | 本ドキュメント。内部設計 |
| `core/engine.js` | テーマ非依存エンジン。CLI 引数解釈、deck 読み込み、pptx 初期化、スライドループ、kinds registry による dispatch、未登録 kind のフォールバック、footer ポリシー。`ShapeType` の提供も担う（§6 参照） |
| `core/text-metrics.js` | `visualCharWidth`（全角換算の文字幅）と `estimateBodyHeight`（折り返し行数からの本文高さ推定）。計算式のみを持ち、フィッティング値は tokens 引数で受ける |
| `themes/<name>/theme.js` | テーマのエントリ。`{ name, tokens, parts, kinds }` を export する。`kinds` は kind 名 → render 関数の registry で、**このテーマがサポートする kind の manifest を兼ねる** |
| `themes/<name>/tokens.js` | デザイントークン。配色・フォント・ページ骨格・タイポグラフィ・パーツ寸法・フィッティング値。値の定義のみ |
| `themes/<name>/parts.js` | 低レベル描画パーツ（タイトル・フッター・カード・パネル・表・プレースホルダ等）とパーツ高さの計算関数 |
| `themes/<name>/kinds/<kind>.js` | kind ごとの描画実装。1 kind = 1 ファイル。`(slide, spec, ctx) => void` を export する |
| `themes/<name>/kinds/_shared.js` | 当該テーマの kind 実装間で共有する配置ロジック（variant 解決、カード行の Y 位置決定等） |
| `themes/<name>/renderer.js` | CLI エントリポイント。`core/engine.run(theme, process.argv)` を呼ぶだけの薄いシム |
| `deck.example.js` | 全 kind を網羅するサンプル deck。書き方のリファレンス兼、変更時の回帰確認用 |
| `deck-<slug>.js` | 生成された個別の deck（成果物） |
| `.claude/skills/make-slides/SKILL.md` | 情報源 → deck.js → .pptx の生成ワークフロー定義 |
| `assets/` | 画像素材（`photo-card` 等が参照） |
| `scripts/gen-sample-images.js` | サンプル画像の生成スクリプト |
| `make-pptx.js` | 旧構成の参考実装。新規生成では使わない（削除せず比較用に残す） |

### テーマの単位

テーマ = `themes/<name>/` ディレクトリ = `theme.js` + `tokens.js` + `parts.js` + `kinds/` + `renderer.js`。現状は `themes/basic/` のみ。

テーマを跨いだ再利用の単位は deck.js である。kind 語彙は概念上「全テーマの和集合」であり、各テーマがどの kind をサポートするかは `theme.js` の `kinds` registry がコード上の manifest として定める。未登録の kind は engine がプレースホルダ描画にフォールバックする。

## 4. core/engine.js の内部構造

engine が持つのは「テーマによらない契約」のみである。

1. **CLI / 初期化**: `run(theme, argv)` が deck パスと出力パスを受け取り、`theme.tokens.SLIDE` の寸法で `pptx.defineLayout` する（basic は 13.333 × 7.5 in の 16:9 ワイド）。
2. **メインループ**: `deck.slides.forEach` で各 spec を dispatch し、その後 footer を付与する。
3. **dispatch**: `theme.kinds[spec.kind]` を lookup し、`render(slide, spec, ctx)` を呼ぶ。未登録なら `theme.parts.addUnimplementedPlaceholder` にフォールバックする（throw しない）。
4. **footer ポリシー**: どの kind に何を出すかは content 側の契約なので engine が決める（`title-slide`: 描画なし / `section-divider`: ページ番号のみ / それ以外: `deck.sections[spec.section]` を解決し、未解決なら `要確認`）。**描画自体**は `theme.parts.addFooter` に委譲する。

### ctx（kind renderer への共有コンテキスト）

kind renderer のシグネチャは `(slide, spec, ctx)` で統一する。`ctx` は engine が組み立て、`deck`（title-slide が `meta` を参照）と `deckDir`（photo-card が画像の相対パスを解決する基準）を持つ。tokens / parts はテーマ内のモジュールを直接 require すればよいため ctx には含めない。

## 5. テーマの内部構造（themes/basic/ を例に）

### 5.1 tokens.js — デザイントークン

| 定数 | 内容 |
|---|---|
| `COLORS` | 配色パレット。背景 / 本文 / アクセント / 枠線に加え、variant 用の pos（緑）/ neg（赤）系 |
| `FONT` | フォントファミリ（現状 `Yu Gothic` 単一） |
| `SLIDE` | ページ骨格。スライド寸法、余白、タイトル / メッセージ / コンテンツ領域 / セクションラベル（左上）/ ページ番号（右下）の座標と高さ。**全 kind が共有するグリッドの基準** |
| `CONTENT_W` | コンテンツ領域幅（= width − marginX × 2 = 12.033 in）。導出値 |
| `TYPOGRAPHY` | 全テキスト要素のフォントサイズ・太さ・行送り・段落間隔の一元管理 |
| `TWO_COL` / `CARD` / `PANEL_CARD` / `PANEL_BULLETS` / `CARD_VARIANTS` / `PANEL_CARD_VARIANTS` | カード系パーツの寸法・内側余白・配色プリセット |

### 5.2 寸法見積もり（core/text-metrics.js + tokens のフィッティング値）

pptxgenjs にはテキストの実描画幅・高さを測定する API が存在しない。このため、カード高さ・折り返し行数は**描画前に推定する**方式を取る。これは本システムで最も壊れやすい部分である。

- 計算式（`visualCharWidth` / `estimateBodyHeight`）は core/text-metrics.js が持つ。テーマ非依存。
- フィッティング値（`CARD.charWMultiplier` / `heightSafety` 等）は各テーマの tokens が持つ。**実レンダリングとの突き合わせでのみ調整可能**で、PPTX や仕様からは導出できない。
- parts.js は core の計算式に自テーマの tokens を束縛したラッパー（`estimateBodyHeight(body, innerW)`）を提供する。

`CARD.charWMultiplier`（basic では 1.07）は「実描画で 1 行に収まる実測字数」と推定式が一致するよう逆算した値である。README / SKILL.md に記載している文字数上限（comparison-2: 29 字、trio: 17 字 等）はこの推定式と整合するよう定めた運用上の契約であり、**片方だけ変更してはならない**。

### 5.3 parts.js — 描画パーツ

`addTitle`（中央揃えタイトル + 中央揃えメッセージ）、`addFooter`（セクションラベルを左上、ページ番号を右下隅に描画）、`addUnimplementedPlaceholder`、`addBullets`（菱形マーカー `◆` 付き箇条書き）、`addCard` / `addCardRow` / `addTwoColRow`（角丸カードとその行揃え配置）、`addPanelCard(Row)` / `addPanelBulletsCard(Row)`（タイトル帯 + 区切り線つきパネル）、`addTable`（ヘッダ帯 + 縞模様の表）、`buildSectionDivider`、および各パーツの高さ計算（`cardHeight` / `panelCardHeight` / `panelBulletsCardHeight`）。

行揃え系ヘルパー（`addCardRow` 等）は「同一行のカード群を、必要高さの最大値に揃えて描画する」責務を持つ。パネル系は空スロット分まで区切り線を引き、件数の異なるカードを横並びにしても区切り位置が揃うようにしている。

### 5.4 kinds/ — kind ごとの描画実装

1 kind = 1 ファイルで、`(slide, spec, ctx) => void` を export する。各ファイルの責務は「spec を解釈し、スライド内の配置（x/y/w/h）を計算し、parts のヘルパーまたは pptxgenjs API を呼ぶ」こと。

複数の kind から使われる配置ロジックは `kinds/_shared.js` に置く:

- `variantOpts()`: variant 名（`pos` / `neg` / `accent` / `gray` / neutral）を `CARD_VARIANTS` の配色 opts に解決する。
- `cardRowY()` / `panelRowY()`: カード行の縦位置決定。既定は上から固定オフセット（`CARD_TOP_GAP = 0.63 in`）、行が高く下余白が上余白を下回る場合は上下中央揃えへシームレスに切り替える。
- `panelRowLayout()`: `panel-cards` / `panel-bullets` 共通の 2/3 枚配置。3 枚配置基準の固定カード幅を使い、2 枚配置のみ最長 item の文字数に応じてカード幅を自動拡大する。
- `drawLabeledBox()`: 図形系 kind（flow-diagram 等）用の「ラベル + 補足」ボックス。

`_shared.js` は「テーマの視覚判断を含む kind 間共有コード」であり、テーマ非依存に見えても core へ移動してはならない（別テーマは別の配置判断を持つ）。

### 5.5 コードの置き場所の判断基準

| 判定 | 置き場所 |
|---|---|
| テーマも kind も知らない（deck の外形・計算式のみ） | `core/` |
| spec のフィールド名（`spec.cards` / `spec.left` 等）を参照する | `themes/<name>/kinds/<kind>.js` |
| 複数 kind で共有するが、このテーマの視覚判断を含む | `themes/<name>/kinds/_shared.js` |
| x/y/w/h・文字列・配列のような素の引数だけで動く描画 | `themes/<name>/parts.js` |
| 値の定義のみ | `themes/<name>/tokens.js` |

`PANEL_CARD` のような特定 kind と結びつきの強い定数が tokens / parts にあるのは、それが「パネルカードという描画パーツの寸法」であり spec 構造を知らないためである。パーツが単一 kind 専用でも、この基準で parts / tokens に置いてよい。

## 6. 設計判断と理由

| 決定 | 理由 |
|---|---|
| エンジンとテーマを分離し、kind 実装はテーマ間で共有しない | テーマごとにレイアウトは別物になる前提のため、継承やデフォルト実装を用意すると「別テーマの見た目が漏れる」事故を生む。共有するのはテーマ非依存のエンジンと計算式のみ。他テーマの kinds ファイルを明示的に import する流用は許容する（仕組みとしては独立） |
| dispatch は switch 文ではなく registry（`theme.kinds`） | テーマのサポート kind 一覧がコード上の manifest になり、kind 追加がテーマ内に閉じる。README のサポート表も実装から機械的に導出できる |
| footer はポリシー（engine）と描画（theme.parts）に分離 | どの kind に footer を出すかは content 側の契約でテーマ間で揃えるべきもの。見た目はテーマの自由 |
| 高さは事前推定方式（`estimateBodyHeight`） | pptxgenjs にテキスト測定 API が無い。autofit 系機能は PowerPoint 側の再計算に依存し出力が安定しないため採用しない。代償として、推定式と README の文字数上限を契約として維持する必要がある（§5.2） |
| 未知の kind はプレースホルダ描画（throw しない） | deck 全体の生成を止めず、問題のスライドを目視で特定できるようにするため。footer の `要確認` 表示も同じ思想 |
| kind 語彙の拡張はテーマ側の実装が先行 | AI が未実装 kind を発明すると成果物が静かに壊れるため、「kinds/ にハンドラ追加 + theme.js に登録 + README に節追加」を経てから deck で使用可能になる |
| `ShapeType` は core/engine.js がモジュールロード時に空インスタンスから取得して export | pptxgenjs v4 では ShapeType enum がインスタンス側にのみ公開されているため。インスタンス生成を 1 回に抑え、テーマ各所から `require("core/engine").ShapeType` で参照する |
| スライドは 13.333 × 7.5 in のカスタムレイアウト | 16:9 ワイド。pptxgenjs 組み込みの `LAYOUT_WIDE`（13.3）との丸め差異を避け、全定数をこの値から導出する |
| `cycle` kind は不採用 | pptxgenjs の図形プリミティブでは循環図の描画品質が安定しなかった。`flow-diagram` / `process-stages` で代替する（README 参照） |

## 7. 拡張手順

### 7.1 既存テーマに新しい kind を追加する

1. `themes/<theme>/kinds/<kind>.js` に `(slide, spec, ctx) => void` を実装する。
2. `themes/<theme>/theme.js` の `kinds` registry に登録する。
3. 描画パーツとして汎用化できる部分（spec 構造を知らない部分）があれば `parts.js` に、複数 kind で共有する配置判断は `kinds/_shared.js` に切り出す（§5.5 の基準）。
4. 文字数・件数の上限を実レンダリングで計測し、制約値を確定する。
5. `README.md` に kind の節（スキーマ・用途・制約）を追加し、「kind を選ぶ判断ガイド」表を更新する。
6. `deck.example.js` に当該 kind のサンプルスライドを追加し、`node themes/<theme>/renderer.js deck.example.js out.pptx` で描画確認する。

制約値（文字数上限等）を README に書かずに kind を公開してはならない。AI は README の制約を唯一の判断材料として deck.js を書くため、制約の欠落はレイアウト破綻に直結する。

### 7.2 新しいテーマを追加する

1. `themes/<name>/` を作成し、`theme.js` / `tokens.js` / `parts.js` / `kinds/` / `renderer.js` を用意する。ひな型として `themes/basic/` の複製から始めてよいが、**core/ の複製は不要**（そこが旧構成との違い）。
2. `tokens.js` のデザイントークンを差し替え、`parts.js` / `kinds/` の描画を作り込む。deck.js スキーマ（kind のフィールド定義）は変更しない。
3. サポートする kind だけを `theme.js` の registry に登録する。未登録 kind はプレースホルダ描画になる。
4. `deck.example.js` を新テーマで描画し、全 kind の破綻有無を確認する。フォント・フォントサイズ・カード幅を変えた場合は文字数上限を再計測し、`charWMultiplier` 等のフィッティング値と README の制約値を新テーマ用に確定する。

テーマ間で deck.js 互換を保つことが最優先の制約である。スキーマを変えたくなった場合は、テーマ固有の分岐ではなく kind 語彙全体の変更として扱い、README と全テーマを同時に更新する。

### 7.3 挙動を変えないリファクタの検証手順

エンジン・テーマの内部整理では、変更前後で `deck.example.js` を描画し、生成 .pptx を unzip して `ppt/` 配下を `diff -r` で比較する。スライド XML はレンダリングが決定的なため、挙動不変ならバイト一致する（`docProps/` はタイムスタンプを含むため比較対象から除外する）。

## 8. 既知の制約

- **文字幅推定は近似である**: `visualCharWidth` + `charWMultiplier` による推定は Yu Gothic の実測に基づく。フォントを変更した場合、フィッティング値の再調整と README の文字数上限の再計測が必要になる。
- **フォントはテーマ単位で単一**: 見出し / 本文でのフォント使い分けは現状未対応（`FONT.body` のみ）。
- **図形表現は pptxgenjs のプリミティブに限定される**: フリーフォーム・複雑なコネクタ・SmartArt 相当は描画できない。
- **画像は事前に用意されたファイルのみ**: AI は画像を生成できないため、`photo-card` 等はユーザが `assets/` に置いたファイルへの相対パス参照で運用する。SVG は非対応（PNG 変換が必要）。
- **生成後の .pptx は編集用データを持たない**: プレースホルダ・スライドマスターを使わない直描画のため、PowerPoint 上でのテーマ一括変更には追従しない。再生成が前提の運用である。

## 9. 未解決事項 / 将来検討

- **参照 PPTX からのテーマ取り込み（pptx-theme-import 構想）**: 人間が PowerPoint で作ったデザイン見本から `themes/<name>/` を起こすワークフロー。中間 JSON（忠実な抽出）と kind 設計（判断業務）の 2 段階に分ける方針まで検討済み。未着手。本リファクタにより、取り込み先の器（tokens / parts / kinds の分離）は整った。
- **README のテーマ別サポート表**: kind 語彙が「全テーマの和集合」になった際、`theme.js` の registry から各テーマのサポート kind 表を機械的に生成して README に載せる仕組み。テーマが 1 つの現状では不要。
- **文字数上限チェックの自動化**: 現状は README の制約を AI が守る運用。deck.js 読み込み時に推定式で検証し警告する lint 層は未実装。
