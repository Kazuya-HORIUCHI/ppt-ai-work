// kind: pyramid — 階層・優先度を視覚化する。
// layout:
//   "centered" (既定): ピラミッドを中央配置し、各層内に label + description を縦並びで配置
//   "side":            ピラミッドを左寄せし、説明文を右側に並べる
const { COLORS, FONT, SLIDE, CONTENT_W } = require("../tokens");
const { addTitle } = require("../parts");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderPyramid(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const layout = spec.layout ?? "centered";
  if (layout === "side") {
    renderPyramidSide(slide, spec);
  } else {
    renderPyramidCentered(slide, spec);
  }
};

function renderPyramidCentered(slide, spec) {
  const n = spec.tiers.length;
  const tierH = 1.0;
  const gap = 0.1;
  const totalH = tierH * n + gap * (n - 1);
  const startY = SLIDE.contentY + (SLIDE.contentH - totalH) / 2;
  // 中心揃え、各層の幅は線形補間。tiers[0] が頂点 (最小幅)、最後が底辺 (最大幅)。
  const maxW = CONTENT_W * 0.7;
  const minW = maxW * 0.32;
  const cx = SLIDE.marginX + CONTENT_W / 2;
  for (let i = 0; i < n; i++) {
    const ratio = n === 1 ? 1 : i / (n - 1);
    const w = minW + (maxW - minW) * ratio;
    const x = cx - w / 2;
    const y = startY + i * (tierH + gap);
    slide.addShape(ShapeType.rect, {
      x, y, w, h: tierH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.accent, width: 1.0 },
    });
    slide.addText(spec.tiers[i].label, {
      x: x + 0.1, y: y + 0.08, w: w - 0.2, h: 0.4,
      fontFace: FONT.body, fontSize: 14, bold: true,
      color: COLORS.accent, align: "center", valign: "middle",
    });
    if (spec.tiers[i].description) {
      slide.addText(spec.tiers[i].description, {
        x: x + 0.15, y: y + 0.5, w: w - 0.3, h: tierH - 0.6,
        fontFace: FONT.body, fontSize: 10, color: COLORS.text,
        align: "center", valign: "top", lineSpacingMultiple: 1.25,
      });
    }
  }
}

function renderPyramidSide(slide, spec) {
  const n = spec.tiers.length;
  const tierH = 0.7;
  const gap = 0.1;
  const totalH = tierH * n + gap * (n - 1);
  const startY = SLIDE.contentY + (SLIDE.contentH - totalH) / 2;
  const maxW = CONTENT_W * 0.55;
  const minW = maxW * 0.32;
  const cxLeft = SLIDE.marginX + CONTENT_W * 0.30;
  for (let i = 0; i < n; i++) {
    const ratio = n === 1 ? 1 : i / (n - 1);
    const w = minW + (maxW - minW) * ratio;
    const x = cxLeft - w / 2;
    const y = startY + i * (tierH + gap);
    slide.addShape(ShapeType.rect, {
      x, y, w, h: tierH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.accent, width: 1.0 },
    });
    slide.addText(spec.tiers[i].label, {
      x, y, w, h: tierH,
      fontFace: FONT.body, fontSize: 13, bold: true,
      color: COLORS.accent, align: "center", valign: "middle",
    });
    if (spec.tiers[i].description) {
      const descX = cxLeft + maxW / 2 + 0.3;
      const descW = SLIDE.marginX + CONTENT_W - descX;
      slide.addText(spec.tiers[i].description, {
        x: descX, y, w: descW, h: tierH,
        fontFace: FONT.body, fontSize: 11, color: COLORS.subText,
        valign: "middle", lineSpacingMultiple: 1.3,
      });
    }
  }
}
