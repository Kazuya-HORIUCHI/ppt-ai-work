// kind: process-stages — 順序のある工程列。番号バッジ付きで「ステップ感」を強調する。
const { COLORS, FONT, SLIDE, CONTENT_W } = require("../tokens");
const { addTitle } = require("../parts");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderProcessStages(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.stages.length;
  const gap = 0.3;
  const itemW = (CONTENT_W - gap * (n - 1)) / n;
  const badgeD = 0.8; // diameter
  const y0 = SLIDE.contentY + 0.6;
  for (let i = 0; i < n; i++) {
    const cx = SLIDE.marginX + i * (itemW + gap) + itemW / 2;
    // 番号バッジ
    slide.addShape(ShapeType.ellipse, {
      x: cx - badgeD / 2, y: y0, w: badgeD, h: badgeD,
      fill: { color: COLORS.accent }, line: { type: "none" },
    });
    slide.addText(String(i + 1), {
      x: cx - badgeD / 2, y: y0, w: badgeD, h: badgeD,
      fontFace: FONT.body, fontSize: 22, bold: true,
      color: "FFFFFF", align: "center", valign: "middle",
    });
    // ラベル
    slide.addText(spec.stages[i].label, {
      x: cx - itemW / 2, y: y0 + badgeD + 0.15, w: itemW, h: 0.5,
      fontFace: FONT.body, fontSize: 14, bold: true,
      color: COLORS.text, align: "center", valign: "top",
    });
    // 説明
    if (spec.stages[i].description) {
      slide.addText(spec.stages[i].description, {
        x: cx - itemW / 2, y: y0 + badgeD + 0.7, w: itemW, h: 2.5,
        fontFace: FONT.body, fontSize: 11, color: COLORS.subText,
        align: "center", valign: "top", lineSpacingMultiple: 1.3,
      });
    }
  }
};
