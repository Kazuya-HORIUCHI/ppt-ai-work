// kind: lead-visual — 左に大きめのリード文、右に円形画像スロット、
// 下部に「アイコン + キャプション」の特徴帯（任意）を置くビジョン提示レイアウト。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addImageSlot } = require("../parts");
const { drawHeader, drawImage, resolveImage } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const BAND_H = 2.0;

module.exports = function renderLeadVisual(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const hasFeatures = Array.isArray(spec.features) && spec.features.length > 0;
  const upperH = SLIDE.contentH - (hasFeatures ? BAND_H + 0.25 : 0.05);

  // 右: 円形画像スロット
  const d = Math.min(upperH - 0.1, 3.1);
  const imgX = SLIDE.marginX + CONTENT_W - d - 0.25;
  drawImage(slide, ctx, spec.image, {
    x: imgX,
    y: SLIDE.contentY + (upperH - d) / 2,
    w: d,
    h: d,
    shape: "circle",
  });

  // 左: リード文（アクセント青・広めの行間）
  slide.addText(spec.lead, {
    x: SLIDE.marginX + 0.1,
    y: SLIDE.contentY + 0.15,
    w: imgX - SLIDE.marginX - 0.6,
    h: upperH - 0.3,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.lead.size,
    color: COLORS.accent,
    align: "left",
    valign: "middle",
    lineSpacingMultiple: TYPOGRAPHY.lead.lineSpacing,
  });

  if (!hasFeatures) return;

  // 下部: 特徴帯（アイコン + キャプション × k、間に破線セパレータ）
  const bandY = SLIDE.contentY + upperH + 0.25;
  addRoundBox(slide, SLIDE.marginX, bandY, CONTENT_W, BAND_H, {
    fillColor: COLORS.bandFill,
    rectRadius: 0.1,
  });
  const k = spec.features.length;
  const itemW = (CONTENT_W - 0.6) / k;
  spec.features.forEach((f, i) => {
    const ix = SLIDE.marginX + 0.3 + i * itemW;
    const iconS = 1.0;
    const { imgPath, label } = resolveImage(ctx, f.image);
    addImageSlot(slide, {
      x: ix + (itemW - iconS) / 2,
      y: bandY + 0.22,
      w: iconS,
      h: iconS,
      imgPath,
      label,
    });
    slide.addText(f.caption, {
      x: ix + 0.1, y: bandY + 1.28, w: itemW - 0.2, h: 0.62,
      fontFace: FONT.body,
      fontSize: 10.5,
      color: COLORS.text,
      align: "center",
      valign: "top",
      lineSpacingMultiple: 1.3,
    });
    if (i < k - 1) {
      slide.addShape(ShapeType.line, {
        x: ix + itemW, y: bandY + 0.3, w: 0, h: BAND_H - 0.6,
        line: { color: COLORS.border, width: 1, dashType: "dash" },
      });
    }
  });
};
