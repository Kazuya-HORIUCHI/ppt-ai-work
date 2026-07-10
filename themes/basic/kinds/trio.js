// kind: trio — 3 つの並列ポイントをカードで並べる。
const { SLIDE, CONTENT_W } = require("../tokens");
const { addTitle, addCardRow } = require("../parts");
const { variantOpts, cardRowY } = require("./_shared");

module.exports = function renderTrio(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const cardGapX = 0.14;
  const cardW = (CONTENT_W - cardGapX * 2) / 3;
  // trio の各カードは既定で "gray"（並列観点をフラットに見せる）。
  // 強調したい場合は最右カードに variant: "accent" / "pos" / "neg" を指定する運用とする。
  const cards = spec.cards.map((c, i) => ({
    x: SLIDE.marginX + (cardW + cardGapX) * i,
    w: cardW,
    title: c.title,
    body: c.body,
    opts: variantOpts(c.variant ?? "gray"),
  }));
  addCardRow(slide, cardRowY(cards), cards);
};
