// kind: flow-diagram — A → B → C の直列フロー。各ステップに短い説明を付ける。
const { COLORS, SLIDE, CONTENT_W } = require("../tokens");
const { addTitle } = require("../parts");
const { drawLabeledBox } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderFlowDiagram(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.steps.length;
  const arrowW = 0.5;
  const arrowH = 0.4;
  const totalArrow = arrowW * (n - 1);
  const boxW = (CONTENT_W - totalArrow) / n;
  const boxH = 2.0;
  const y = SLIDE.contentY + 1.2;
  for (let i = 0; i < n; i++) {
    const x = SLIDE.marginX + i * (boxW + arrowW);
    drawLabeledBox(slide, x, y, boxW, boxH, spec.steps[i].label, spec.steps[i].description);
    if (i < n - 1) {
      slide.addShape(ShapeType.rightArrow, {
        x: x + boxW, y: y + (boxH - arrowH) / 2, w: arrowW, h: arrowH,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
  }
};
