// kind: circle-chain — 円形画像ノードを矢印でつないだ展開チェーン（最大 7 ノード）。
// 上部に任意のリード文、下部に任意のまとめ帯を置く。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addSummaryBand, addImageSlot } = require("../parts");
const { palette, resolveImage, drawHeader } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const BAND_H = 1.5;

module.exports = function renderCircleChain(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const hasLead = !!spec.lead;
  const hasSummary = !!spec.summary;
  const leadH = hasLead ? 1.0 : 0;

  if (hasLead) {
    slide.addText(spec.lead, {
      x: SLIDE.marginX + 0.1,
      y: SLIDE.contentY,
      w: CONTENT_W - 0.2,
      h: leadH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.leadSmall.size,
      color: COLORS.accent,
      align: "left",
      valign: "top",
      lineSpacingMultiple: TYPOGRAPHY.leadSmall.lineSpacing,
    });
  }

  const zoneY = SLIDE.contentY + leadH + 0.1;
  const zoneH = SLIDE.contentH - leadH - 0.1 - (hasSummary ? BAND_H + 0.25 : 0);

  const n = spec.nodes.length;
  const arrowW = 0.32;
  const d = Math.min(1.4, (CONTENT_W - arrowW * (n - 1)) / n - 0.04, zoneH - 0.75);
  const totalW = d * n + arrowW * (n - 1);
  const startX = SLIDE.marginX + (CONTENT_W - totalW) / 2;
  const circleY = zoneY + Math.max(0, (zoneH - d - 0.75) / 2);

  spec.nodes.forEach((node, i) => {
    const x = startX + i * (d + arrowW);
    const pal = palette(i, node.variant);
    const { imgPath, label } = resolveImage(ctx, node.image);
    addImageSlot(slide, {
      x, y: circleY, w: d, h: d,
      imgPath, label,
      shape: "circle",
      ringColor: pal.border,
    });
    slide.addText(node.label, {
      x: x - 0.2, y: circleY + d + 0.10, w: d + 0.4, h: 0.65,
      fontFace: FONT.body, fontSize: 10.5, color: COLORS.text,
      align: "center", valign: "top", lineSpacingMultiple: 1.25,
    });
    if (i < n - 1) {
      slide.addShape(ShapeType.rightArrow, {
        x: x + d + 0.04,
        y: circleY + d / 2 - 0.10,
        w: arrowW - 0.08,
        h: 0.20,
        fill: { color: COLORS.arrow },
        line: { type: "none" },
      });
    }
  });

  if (hasSummary) {
    const bandY = SLIDE.contentY + SLIDE.contentH - BAND_H;
    const imageSlot = spec.summary.image
      ? { ...resolveImage(ctx, spec.summary.image) }
      : null;
    addSummaryBand(slide, bandY, BAND_H, spec.summary.text, {
      imageSlot,
      align: "left",
    });
  }
};
