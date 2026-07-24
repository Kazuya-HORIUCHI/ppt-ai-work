// themes/pastel/tokens.js
// pastel テーマのデザイントークン。
// 参照デザイン: おとつぶぴあの事業イメージ資料（パステル調・イラスト枠つき）のトレース。
// 背景は白固定（背景画像は別途ユーザが用意する前提のため、装飾背景を持たない）。

const COLORS = {
  bg: "FFFFFF",
  bgSubtle: "F5F7F9",
  text: "3F4A56",        // 柔らかいチャコール（真っ黒を使わない）
  subText: "6B7684",
  muted: "9AA4AE",
  border: "DCE1E6",
  accent: "4A7BA6",      // リード文・強調テキストの青
  accentDark: "3E6A91",
  badgeFill: "D6E4EF",   // 番号バッジ円の塗り
  bandFill: "E9F0F5",    // 下部まとめ帯・特徴帯の塗り
  ribbon: "BBDCC4",      // 表紙・章扉の下線リボン（淡い緑）
  arrow: "AFC9DD",       // カード間・列間の矢印（淡い青）
  boxYellow: "FAF4E1",   // 連絡先ボックス等の淡い黄
};

// カード・行・ノードへ順に割り当てるパステルパレット（参照デザインの 5 色）。
// fill = カード塗り / border = 枠線 / strong = タイトル・強調テキスト色。
const PALETTE = [
  { key: "blue",   fill: "E8F0F6", border: "BFD4E4", strong: "4A7BA6" },
  { key: "yellow", fill: "FAF4E1", border: "E6D6A8", strong: "A8862F" },
  { key: "pink",   fill: "F9EAEC", border: "E7C2C9", strong: "C0707F" },
  { key: "green",  fill: "EAF2EC", border: "C2D9C9", strong: "5E9475" },
  { key: "purple", fill: "EFEBF7", border: "D0C5E6", strong: "826FB0" },
];

const FONT = {
  body: "Yu Gothic",
};

const SLIDE = {
  width: 13.333,
  height: 7.5,
  marginX: 0.65,
  // ヘッダ（番号バッジ + 左寄せタイトル + アクセント色メッセージ）
  titleY: 0.32,
  titleH: 0.62,
  messageY: 0.98,
  messageH: 0.55,
  contentY: 1.62,
  contentH: 5.33,
  // セクションラベル（左上）・ページ番号（右下）
  sectionLabelX: 0.38,
  sectionLabelY: 0.12,
  footerY: 7.10,
  footerH: 0.30,
  pageNumRightInset: 0.30,
};

const CONTENT_W = SLIDE.width - SLIDE.marginX * 2;

// ヘッダの番号バッジ寸法
const HEADER = {
  badgeD: 0.55,       // バッジ円の直径
  badgeTextSize: 20,
  titleOffsetX: 0.80, // バッジ右端からタイトル開始位置まで
  barW: 0.09,         // header: "bar" 指定時の縦バー幅
};

// 画像スロット（プレースホルダ）の見た目
const IMAGE_SLOT = {
  fill: "FDFDFD",
  borderColor: "B7C2CC",
  labelSize: 9,
};

// core/text-metrics.js 互換のフィッティング値（basic と同じ Yu Gothic 実測に基づく）
const CARD = {
  padTop: 0.20,
  padBottom: 0.30,
  padSide: 0.18,
  titleH: 0.28,
  titleBodyGap: 0.20,
  bulletIndentIn: 0.26,
  charWMultiplier: 1.07,
  heightSafety: 1.05,
};

const TYPOGRAPHY = {
  // ヘッダ
  slideTitle:         { size: 26, bold: true },
  slideMessage:       { size: 13, bold: true },
  footer:             { size: 9 },
  // カード内
  cardTitle:          { size: 13, bold: true },
  cardBody:           { size: 11, lineSpacing: 1.35 },
  cardBullet:         { size: 11, lineSpacing: 1.3, paraSpaceAfterPt: 6 },
  cardCaption:        { size: 11, lineSpacing: 1.45 },
  cardConclusion:     { size: 11.5, bold: true },
  // 下部まとめ帯
  band:               { size: 13, lineSpacing: 1.4 },
  // リード文（lead-visual / circle-chain 等）
  lead:               { size: 17, lineSpacing: 1.6 },
  leadSmall:          { size: 13.5, lineSpacing: 1.5 },
  // 表・行系
  rowLabel:           { size: 11, bold: true },
  rowBody:            { size: 10, lineSpacing: 1.3 },
  cellBody:           { size: 10, lineSpacing: 1.25 },
  // タイトルスライド・章扉
  titleSlideHeading:  { size: 36, bold: true, lineSpacing: 1.25 },
  titleSlideSubtitle: { size: 16 },
  titleSlideMeta:     { size: 10 },
  dividerTitle:       { size: 32, bold: true },
  dividerSubtitle:    { size: 14 },
  // 未実装プレースホルダ
  todo:               { size: 18 },
};

module.exports = {
  COLORS,
  PALETTE,
  FONT,
  SLIDE,
  CONTENT_W,
  HEADER,
  IMAGE_SLOT,
  CARD,
  TYPOGRAPHY,
};
