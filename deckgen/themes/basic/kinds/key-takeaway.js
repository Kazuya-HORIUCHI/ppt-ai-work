// kind: key-takeaway — ひと言の結論を中央に大きく強調する。結論テキストのみを描画する。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle } = require("../parts");

// 結論テキストのボックス高。36pt × lineSpacing 1.3（= 0.65 in/行）の 3 行ぶんを
// 確保した固定値。行数によらず高さは変えず、コンテンツ領域内で中央よりやや上
//（余白を上:下 = 1:1.8 に配分）に置く。
const TAKEAWAY_H = 1.95;

module.exports = function renderKeyTakeaway(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const y = SLIDE.contentY + (SLIDE.contentH - TAKEAWAY_H) / 2.8;
  slide.addText(spec.takeaway, {
    x: SLIDE.marginX,
    y,
    w: CONTENT_W,
    h: TAKEAWAY_H,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.takeaway.size,
    bold: TYPOGRAPHY.takeaway.bold,
    color: COLORS.accent,
    align: "center",
    valign: "middle",
    lineSpacingMultiple: TYPOGRAPHY.takeaway.lineSpacing,
  });
};
