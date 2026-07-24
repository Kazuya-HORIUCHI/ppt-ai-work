// themes/basic/kinds/_shared.js
// basic テーマの kind 実装間で共有する配置ロジック。
// 複数の kind から使われるが「basic テーマの視覚判断」なので core には置かない。

const { COLORS, FONT, SLIDE, CONTENT_W, CARD_VARIANTS, PANEL_CARD } = require("../tokens");
const { cardHeight } = require("../parts");
const { visualCharWidth } = require("../../../core/text-metrics");
const { ShapeType } = require("../../../core/engine");

// カード行の固定上余白（cardRowY / panelRowY の既定オフセット）。
// 6 件程度の bullet がちょうど良く見える位置として決め打ち。詳細は cardRowY のコメント参照。
const CARD_TOP_GAP = 0.63;

// variant 名 ("pos" | "neg" | "accent" | "gray" | "neutral" | undefined) を CARD_VARIANTS の opts に解決する。
function variantOpts(variant) {
  if (variant === "pos") return CARD_VARIANTS.pos;
  if (variant === "neg") return CARD_VARIANTS.neg;
  if (variant === "accent") return CARD_VARIANTS.accent;
  if (variant === "gray") return CARD_VARIANTS.gray;
  return {}; // neutral / 未指定はカード既定スタイル（タイトルがアクセント色）
}

// カード行の y 位置を返す。
//
// 配置ルール:
//   1. 既定: 上から固定オフセット (CARD_TOP_GAP) の位置に揃える。
//      6 件程度の bullet がちょうど良く見える位置として決め打ち。
//   2. 行が高くなり下の余白が上の余白より小さくなる場合 (slack < 2 * CARD_TOP_GAP):
//      上下中央揃えに切り替える。固定値からシームレスに連続する。
//   3. 行高がコンテンツ領域を超える場合: contentY を天井としてそこに揃え、超過分は下方向にあふれる。
function cardRowY(cards) {
  const rowH = Math.max(...cards.map((c) => cardHeight(c.title, c.body, c.w)));
  const slack = SLIDE.contentH - rowH;
  if (slack < 2 * CARD_TOP_GAP) {
    return SLIDE.contentY + Math.max(0, slack / 2);
  }
  return SLIDE.contentY + CARD_TOP_GAP;
}

// panel-cards / panel-bullets 共通の行 Y 位置決定ロジック。
// 既定は上から固定オフセット (CARD_TOP_GAP)、行高がコンテンツ領域の余白を超える
// なら垂直中央寄せにフォールバックする（cardRowY と同じ判断）。rowH は kind ごとの
// カード高計算関数（panelCardHeight / panelBulletsCardHeight）から渡す。
function panelRowY(rowH) {
  const slack = SLIDE.contentH - rowH;
  return slack < 2 * CARD_TOP_GAP
    ? SLIDE.contentY + Math.max(0, slack / 2)
    : SLIDE.contentY + CARD_TOP_GAP;
}

// panel-cards / panel-bullets 共通の 2/3 枚配置ロジック。
//
// 3 枚配置を基準に、カード幅は枚数によらず同じ値を使う。これにより 2 枚版でも
// 各カードは 3 枚版と同じ字数上限になり、視覚的にも整う。2 枚版のカード間隔は
// SLIDE.marginX (0.65 in) より少し狭い 0.55 in を基準に 1.7 倍した 0.935 in を
// 取り、カードはコンテンツ領域内で水平中央に配置する。3 枚配置は左寄せで詰める。
//
// 2 枚配置のみ、最長 item が 17 字を超えたら cardW を伸ばす。1 全角 = 0.192 in
// (cards 3 枚配置の worst-case) を基準に必要な innerW を求め、cardW = innerW + 2 × itemPadSide。
// コンテンツ領域内に収まる最大値で頭打ち。3 枚配置 / 17 字以内の 2 枚配置は
// defaultCardW を使う。
//
// opts (panel-bullets 用):
//   extraChars: bullet + gap ぶんの余裕を全角字数で上乗せする（既定 0）
//   emPerChar:  1 全角字の in 幅（既定 0.192, panel-cards の 12pt worst-case）
function panelRowLayout(specCards, opts = {}) {
  const extraChars = opts.extraChars || 0;
  const emPerChar = opts.emPerChar || 0.192;
  const n = specCards.length;
  const cardGapThree = 0.28;
  const defaultCardW = (CONTENT_W - cardGapThree * 2) / 3;
  const cardGapX = n === 2 ? 0.935 : cardGapThree;
  const DEFAULT_THRESHOLD_CHARS = 17;
  let cardW = defaultCardW;
  if (n === 2) {
    const maxChars = Math.max(
      ...specCards.flatMap((c) => c.items.map(visualCharWidth))
    );
    const effectiveChars = maxChars + extraChars;
    if (effectiveChars > DEFAULT_THRESHOLD_CHARS) {
      const requiredW = effectiveChars * emPerChar + PANEL_CARD.itemPadSide * 2;
      const maxCardW = (CONTENT_W - cardGapX) / 2;
      cardW = Math.min(maxCardW, Math.max(defaultCardW, requiredW));
    }
  }
  const totalW = cardW * n + cardGapX * (n - 1);
  const startX = SLIDE.marginX + (CONTENT_W - totalW) / 2;
  return specCards.map((c, i) => ({
    x: startX + (cardW + cardGapX) * i,
    w: cardW,
    title: c.title,
    items: c.items,
    variant: c.variant,
  }));
}

// 図形系 kind 用の汎用ボックス（ラベル + 補足）描画ヘルパー。
function drawLabeledBox(slide, x, y, w, h, label, description, opts = {}) {
  const fillColor = opts.fillColor || COLORS.bgSubtle;
  const borderColor = opts.borderColor || COLORS.accent;
  const labelColor = opts.labelColor || COLORS.accent;
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: borderColor, width: 1.0 },
    rectRadius: 0.08,
  });
  const hasDesc = description && description.length > 0;
  if (hasDesc) {
    slide.addText(label, {
      x: x + 0.12, y: y + 0.10, w: w - 0.24, h: 0.4,
      fontFace: FONT.body, fontSize: 13, bold: true, color: labelColor,
      align: "center", valign: "middle",
    });
    slide.addText(description, {
      x: x + 0.12, y: y + 0.55, w: w - 0.24, h: h - 0.65,
      fontFace: FONT.body, fontSize: 10, color: COLORS.text,
      align: "center", valign: "top", lineSpacingMultiple: 1.25,
    });
  } else {
    slide.addText(label, {
      x: x + 0.12, y, w: w - 0.24, h,
      fontFace: FONT.body, fontSize: 14, bold: true, color: labelColor,
      align: "center", valign: "middle",
    });
  }
}

module.exports = {
  CARD_TOP_GAP,
  variantOpts,
  cardRowY,
  panelRowY,
  panelRowLayout,
  drawLabeledBox,
};
