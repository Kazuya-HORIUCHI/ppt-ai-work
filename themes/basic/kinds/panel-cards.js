// kind: panel-cards — 2〜3 枚の「見出し帯付きパネル」カードを横並びで描画する。
// 各カードはタイトル帯（variant 色背景・白文字）と、区切り線つきの items リスト
// から成る。items は水平中央揃え、カード間にセパレータ線が入る。
const { addTitle, addPanelCardRow, panelCardHeight } = require("../parts");
const { panelRowLayout, panelRowY } = require("./_shared");

module.exports = function renderPanelCards(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const cards = panelRowLayout(spec.cards);
  const maxItems = Math.max(...spec.cards.map((c) => c.items.length));
  const rowH = panelCardHeight(new Array(maxItems));
  addPanelCardRow(slide, panelRowY(rowH), cards);
};
