// themes/basic/tokens.js
// basic テーマのデザイントークン（配色・フォント・ページ骨格・タイポグラフィ・パーツ寸法）。
// 値の定義のみを持ち、描画ロジックは parts.js / kinds/ 側に置く。

const COLORS = {
  bg: "FFFFFF",
  bgSubtle: "F9FAFB",
  text: "111827",
  subText: "4B5563",
  accent: "2563EB",
  accentLight: "EFF6FF",
  border: "D1D5DB",
  muted: "6B7280",
  posBg: "ECFDF5",
  posBorder: "10B981",
  negBg: "FEF2F2",
  negBorder: "EF4444",
};

const FONT = {
  body: "Yu Gothic",
};

const SLIDE = {
  width: 13.333,
  height: 7.5,
  marginX: 0.65,
  // タイトル（中央揃え・28pt）。titleY/titleH の中心 ≈ 0.93 in は参照デザインのトレース値
  titleY: 0.55,
  titleH: 0.75,
  // サブタイトル（中央揃え・14pt・濃グレー）
  messageY: 1.38,
  messageH: 0.50,
  contentY: 2.05,
  contentH: 4.85,
  // セクションラベル（左上）。marginX より外側に置き、本文グリッドと独立させる
  sectionLabelX: 0.38,
  sectionLabelY: 0.25,
  // ページ番号（右下）。右端からの inset は marginX より狭く、隅に寄せる
  footerY: 7.10,
  footerH: 0.30,
  pageNumRightInset: 0.30,
};

const CONTENT_W = SLIDE.width - SLIDE.marginX * 2;

// 標準的な2カード左右レイアウトの寸法（contentY 起点、各カードの高さは内容に応じて算出）
const TWO_COL = {
  leftX: SLIDE.marginX,
  rightX: SLIDE.marginX + (CONTENT_W - 0.30) / 2 + 0.30,
  colW: (CONTENT_W - 0.30) / 2,
  y: SLIDE.contentY,
};

// カードの配色プリセット（addCard の opts に渡す）。
// カードは枠線なしのフラット塗りなので、variant は fill とタイトル色の組で表現する。
const CARD_VARIANTS = {
  neg:    { fillColor: COLORS.negBg,       titleColor: COLORS.negBorder },
  pos:    { fillColor: COLORS.posBg,       titleColor: COLORS.posBorder },
  accent: { fillColor: COLORS.accentLight, titleColor: COLORS.accent    },
  gray:   { fillColor: COLORS.bgSubtle,    titleColor: COLORS.text      },
};

// カード／ボックスの内側余白・本文高さ推定パラメータ（幾何のみ）
//
// charWMultiplier:
//   1 文字あたりの推定幅 = (fontSize / 72) * charWMultiplier (inches)。
//   実描画（Yu Gothic, 12pt）で 1 行に収まる字数の実測上限と、
//   Math.floor(usableW / charWIn) の結果が一致する最大値を逆算する:
//     cards 2 枚配置 (usableW = 5.2065 in, 実測上限 29 字) → multiplier ≤ 5.2065 / 29 / (12/72) ≈ 1.0772
//     cards 3 枚配置 (usableW = 3.258 in,  実測上限 17 字) → multiplier ≤ 3.258  / 17 / (12/72) ≈ 1.1499
//   2 枚配置側がより厳しい上限を課すため、その制約を満たす値として 1.07 を採用。
//   3 枚配置側は実測 17 字に対して formula は 18 字/行と算出する（やや楽観的）が、
//   17 字ルールを README/SKILL で守らせている限りカード高の不足は発生しない。
//   1.07 未満まで下げると、長い本文が想定外に 1 行扱いされ、カード高が不足するリスクが増える。
const CARD = {
  padTop: 0.22,
  // 下余白。最終 bullet の paraSpaceAfter は cardHeight 側でカード高から差し引くため、
  // カード下端の見た目の余白は実質この値（+ 高さ推定の safety ぶんの緩み）で決まる。
  // 0.30 では最終 bullet がカード下端に詰まって見えたため 0.42 に広げた
  // （旧実装の実効下余白 ≈ 0.67 と 0.30 の中間）。
  padBottom: 0.42,
  padSide: 0.18,
  titleH: 0.28,
  // タイトルと本文の間隔。bullet の行ピッチ（0.55 in）による bullet 間の空きと
  // 釣り合って見える値として決める。
  titleBodyGap: 0.26,
  bulletIndentIn: 0.30,
  charWMultiplier: 1.07,
  heightSafety: 1.05,
};

// 見出し帯付きパネルカード（panel-cards / panel-bullets）の寸法。
// - タイトル帯はカード単位で variant 切替可（accent / pos / neg）
// - body は短文の items 配列のみ受け付ける
// - items は 1 行で表示することを前提とする（折り返しは考慮しない）
const PANEL_CARD = {
  titleBarH: 0.55,
  itemRowH: 0.55,
  itemPadSide: 0.20,
  separatorH: 0.008,
};

// panel-card のカラー variant。タイトル帯と本文枠線をセットで切り替える。
// 既定は accent（テーマ青）。pos / neg は cards と同じ色味を流用する。
const PANEL_CARD_VARIANTS = {
  accent: { titleBarColor: COLORS.accent,    bodyBorderColor: COLORS.border },
  pos:    { titleBarColor: COLORS.posBorder, bodyBorderColor: COLORS.posBorder },
  neg:    { titleBarColor: COLORS.negBorder, bodyBorderColor: COLORS.negBorder },
};

// panel-bullets（panel-cards の箇条書きバージョン）固有のパラメータ。
//
// bodyPadY:
//   ボディ領域の上下に取るパディング。無指定だと最上段・最下段の item が
//   カード上下端に張り付いて見えるため、行間相当（itemRowH / 2）を基準に確保する。
//   基準値 0.275 から 10% 縮小した値を使う。
//
// itemPadLeft:
//   行頭（bullet 列）の左余白。カード共通の itemPadSide (0.20) の 2 倍。
//   右余白は itemPadSide のまま。
//
// bulletGapCharUnits:
//   ◆ + 字間スペースを何字ぶんとして見積もるか（bullet 幅を字幅の何倍とみなすか）。
//   2 枚配置のカード幅自動拡大で、テキストだけでなく bullet 部分の幅も
//   織り込むために使う。
const PANEL_BULLETS = {
  itemFontSize: 13,
  bodyPadY: 0.2475, // = PANEL_CARD.itemRowH / 2 (0.275) × 0.9
  itemPadLeft: 0.40, // = PANEL_CARD.itemPadSide × 2
  bulletGapCharUnits: 2,
};

// 全テキスト要素のフォントサイズ・太さ・行送り・段落間隔を一元管理する。
// size は pt、lineSpacing は倍率、paraSpaceAfterPt は pt 単位。
const TYPOGRAPHY = {
  // 各スライド上部
  slideTitle:         { size: 28, bold: true },
  slideMessage:       { size: 13, bold: true },
  // フッター
  footer:             { size: 9 },
  // スライドに直貼りする箇条書き（カードに入らない場合）
  slideBullet:        { size: 14, lineSpacing: 1.25, paraSpaceAfterPt: 8 },
  // list-rows の行テキストと、アクセントブロック内の連番
  listRow:            { size: 16 },
  listRowNumber:      { size: 20, bold: true },
  // カード内
  cardTitle:          { size: 13, bold: true },
  cardBody:           { size: 12, lineSpacing: 1.3 },
  // cardBullet はフォントサイズを panel-bullets（PANEL_BULLETS.itemFontSize = 13pt）に揃え、
  // 1 行 bullet のピッチ（size × lineSpacing + paraSpaceAfterPt = 15.6 + 24 = 39.6pt = 0.55 in）が
  // panel-bullets の行高（PANEL_CARD.itemRowH = 0.55 in）と一致するように行間を取る。
  cardBullet:         { size: 13, lineSpacing: 1.2, paraSpaceAfterPt: 24 },
  // 表
  tableBody:          { size: 11 },
  // key-takeaway の結論テキスト
  takeaway:           { size: 36, bold: true, lineSpacing: 1.3 },
  // タイトルスライド
  titleSlideEyebrow:  { size: 16, bold: true },
  titleSlideHeading:  { size: 36, bold: true, lineSpacing: 1.2 },
  titleSlideSubtitle: { size: 14 },
  titleSlideMeta:     { size: 10 },
  // セクション区切り
  dividerLabel:       { size: 18, bold: true },
  dividerTitle:       { size: 32, bold: true, lineSpacing: 1.2 },
  // 補足注記（※ 行）
  noteSmall:          { size: 10 },
  noteMedium:         { size: 11 },
  // 未実装プレースホルダ
  todo:               { size: 18 },
};

module.exports = {
  COLORS,
  FONT,
  SLIDE,
  CONTENT_W,
  TWO_COL,
  CARD,
  CARD_VARIANTS,
  PANEL_CARD,
  PANEL_CARD_VARIANTS,
  PANEL_BULLETS,
  TYPOGRAPHY,
};
