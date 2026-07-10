// kind: comparison-2 — 左右に 2 主体を並べて対比する。
const { TWO_COL } = require("../tokens");
const { addTitle, addTwoColRow } = require("../parts");
const { variantOpts, cardRowY } = require("./_shared");

module.exports = function renderComparison2(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // x/w は addTwoColRow が注入するが、行高の事前計算には w が必要なので
  // 同じ値を cardRowY 用の card 仮オブジェクトにも持たせる。
  const cards = [
    {
      title: spec.left.title,
      body: spec.left.body,
      w: TWO_COL.colW,
      opts: variantOpts(spec.left.variant),
    },
    {
      title: spec.right.title,
      body: spec.right.body,
      w: TWO_COL.colW,
      opts: variantOpts(spec.right.variant),
    },
  ];
  addTwoColRow(slide, cardRowY(cards), cards);
};
