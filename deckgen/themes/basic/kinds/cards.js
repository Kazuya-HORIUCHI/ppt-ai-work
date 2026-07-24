// kind: cards — 2〜3 枚の本文カードを横並びで描画する。
// 2 枚は左右の対比（旧 comparison-2）、3 枚は並列観点（旧 trio）を想定し、
// 枚数でレイアウトと既定 variant を切り替える。
const { COLORS, FONT, SLIDE, CONTENT_W, TWO_COL, TYPOGRAPHY } = require("../tokens");
const { addTitle, addCardRow } = require("../parts");
const { variantOpts, cardRowY } = require("./_shared");

// 3 枚配置のカード間隔
const TRIO_GAP_X = 0.14;

module.exports = function renderCards(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.cards.length;
  if (n < 2 || n > 3) {
    slide.addText(`cards: cards は 2〜3 件（現在 ${n} 件）`, {
      x: 1, y: 3, w: 11, h: 1,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.todo.size, color: COLORS.negBorder,
    });
    return;
  }
  let cards;
  if (n === 2) {
    // 2 枚: TWO_COL の左右に配置。既定 variant は neutral（タイトルのみアクセント色）。
    cards = spec.cards.map((c, i) => ({
      x: i === 0 ? TWO_COL.leftX : TWO_COL.rightX,
      w: TWO_COL.colW,
      title: c.title,
      body: c.body,
      opts: variantOpts(c.variant),
    }));
  } else {
    // 3 枚: 左から等分に詰める。既定 variant は "gray"（並列観点をフラットに見せる）。
    // 強調したい場合は最右カードに variant: "accent" / "pos" / "neg" を指定する運用とする。
    const cardW = (CONTENT_W - TRIO_GAP_X * 2) / 3;
    cards = spec.cards.map((c, i) => ({
      x: SLIDE.marginX + (cardW + TRIO_GAP_X) * i,
      w: cardW,
      title: c.title,
      body: c.body,
      opts: variantOpts(c.variant ?? "gray"),
    }));
  }
  addCardRow(slide, cardRowY(cards), cards);
};
