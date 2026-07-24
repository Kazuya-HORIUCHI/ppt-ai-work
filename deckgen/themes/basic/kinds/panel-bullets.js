// kind: panel-bullets — panel-cards の箇条書き版。レイアウト・寸法・variant・行高は
// panel-cards と共有し、items の表示だけを菱形マーカー付き箇条書きに差し替える。
// フォントサイズは TYPOGRAPHY.cardBody (12pt) の約 1.1 倍として 13pt を使う。
//
// 2 枚配置の自動拡大には次の 2 点を上乗せして渡す:
//   - extraChars: bullet + gap ぶんの余裕を PANEL_BULLETS.bulletGapCharUnits 分
//     加算し、テキストだけでなく bullet 部分もカード幅に組み込む
//   - emPerChar:  panel-cards の 12pt worst-case (0.192) を font size 比で
//     13pt にスケールした値。実描画時の 1 全角字幅 (≈ 0.193) よりわずかに
//     大きく、折り返しを起こさない側に倒した見積もりになる
const { PANEL_BULLETS } = require("../tokens");
const { addTitle, addPanelBulletsCardRow, panelBulletsCardHeight } = require("../parts");
const { panelRowLayout, panelRowY } = require("./_shared");

module.exports = function renderPanelBullets(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const cards = panelRowLayout(spec.cards, {
    extraChars: PANEL_BULLETS.bulletGapCharUnits,
    emPerChar: 0.192 * (PANEL_BULLETS.itemFontSize / 12),
  });
  const maxItems = Math.max(...spec.cards.map((c) => c.items.length));
  const rowH = panelBulletsCardHeight(new Array(maxItems));
  addPanelBulletsCardRow(slide, panelRowY(rowH), cards);
};
