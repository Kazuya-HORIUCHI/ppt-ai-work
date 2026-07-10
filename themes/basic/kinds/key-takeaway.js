// kind: key-takeaway — ひと言の結論を中央に大きく強調する。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle, addBullets } = require("../parts");

module.exports = function renderKeyTakeaway(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const hasSupporting = spec.supporting && spec.supporting.length > 0;
  const takeawayH = hasSupporting ? 1.6 : 2.6;
  const takeawayY = SLIDE.contentY + (hasSupporting ? 0.4 : 1.0);
  slide.addText(spec.takeaway, {
    x: SLIDE.marginX, y: takeawayY, w: CONTENT_W, h: takeawayH,
    fontFace: FONT.body, fontSize: 28, bold: true,
    color: COLORS.accent, align: "center", valign: "middle",
    lineSpacingMultiple: 1.3,
  });
  if (hasSupporting) {
    addBullets(
      slide,
      spec.supporting,
      SLIDE.marginX + 1.0,
      takeawayY + takeawayH + 0.3,
      CONTENT_W - 2.0,
      2.0,
      TYPOGRAPHY.slideBullet
    );
  }
};
