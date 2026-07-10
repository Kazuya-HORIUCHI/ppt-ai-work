// kind: matrix-2x2 — 2 軸で 4 象限に分類する。
const { COLORS, FONT, SLIDE, CONTENT_W } = require("../tokens");
const { addTitle } = require("../parts");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderMatrix2x2(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // 軸ラベル領域
  const yLabelW = 0.8;  // 左側の Y 軸ラベル幅
  const xLabelH = 0.4;  // 下側の X 軸ラベル高さ
  const matX = SLIDE.marginX + yLabelW;
  const matY = SLIDE.contentY;
  const matW = CONTENT_W - yLabelW;
  const matH = SLIDE.contentH - xLabelH;
  const cellW = matW / 2;
  const cellH = matH / 2;

  // 4 セル: topLeft, topRight, bottomLeft, bottomRight の順
  const cells = [
    { x: matX,         y: matY,         q: spec.quadrants.topLeft },
    { x: matX + cellW, y: matY,         q: spec.quadrants.topRight },
    { x: matX,         y: matY + cellH, q: spec.quadrants.bottomLeft },
    { x: matX + cellW, y: matY + cellH, q: spec.quadrants.bottomRight },
  ];
  for (const { x, y, q } of cells) {
    slide.addShape(ShapeType.rect, {
      x, y, w: cellW, h: cellH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(q.title, {
      x: x + 0.15, y: y + 0.12, w: cellW - 0.3, h: 0.4,
      fontFace: FONT.body, fontSize: 13, bold: true,
      color: COLORS.accent, valign: "top",
    });
    if (q.body) {
      slide.addText(q.body, {
        x: x + 0.15, y: y + 0.55, w: cellW - 0.3, h: cellH - 0.7,
        fontFace: FONT.body, fontSize: 11, color: COLORS.text,
        valign: "top", lineSpacingMultiple: 1.3,
      });
    }
  }
  // X 軸ラベル（下側、low が左 / high が右）
  slide.addText(spec.xAxis.low, {
    x: matX, y: matY + matH, w: cellW, h: xLabelH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  slide.addText(spec.xAxis.high, {
    x: matX + cellW, y: matY + matH, w: cellW, h: xLabelH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  // Y 軸ラベル（左側、high が上 / low が下）
  slide.addText(spec.yAxis.high, {
    x: SLIDE.marginX, y: matY, w: yLabelW, h: cellH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  slide.addText(spec.yAxis.low, {
    x: SLIDE.marginX, y: matY + cellH, w: yLabelW, h: cellH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
};
