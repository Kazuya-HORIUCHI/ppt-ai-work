// kind: timeline — 水平タイムライン。STEP を線の上下交互に配置する（3〜5 ステップ）。
// 各 STEP は画像スロット + STEP バッジ + ラベル + 説明文で構成する。
const { COLORS, FONT, SLIDE, CONTENT_W } = require("../tokens");
const { addImageSlot } = require("../parts");
const { palette, resolveImage, drawHeader } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const LINE_COLOR = "9CC5A8"; // 淡い緑（参照デザインのタイムライン軸）

module.exports = function renderTimeline(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const n = spec.steps.length;
  const lineY = SLIDE.contentY + SLIDE.contentH * 0.52;

  // 軸線 + 右端矢印
  slide.addShape(ShapeType.rect, {
    x: SLIDE.marginX, y: lineY - 0.022, w: CONTENT_W - 0.4, h: 0.044,
    fill: { color: LINE_COLOR }, line: { type: "none" },
  });
  slide.addShape(ShapeType.rightArrow, {
    x: SLIDE.marginX + CONTENT_W - 0.45, y: lineY - 0.13, w: 0.45, h: 0.26,
    fill: { color: LINE_COLOR }, line: { type: "none" },
  });

  const slotW = CONTENT_W / n;
  const blockW = Math.min(slotW + 0.55, 3.6);
  const blockH = 2.25;

  spec.steps.forEach((step, i) => {
    const pal = palette(i, step.variant);
    const cx = SLIDE.marginX + slotW * (i + 0.5);
    const above = i % 2 === 1; // STEP1 は線の下、STEP2 は上…（参照デザインの並び）
    const by = above ? lineY - 0.42 - blockH : lineY + 0.42;
    const bx = Math.max(
      SLIDE.marginX - 0.05,
      Math.min(cx - blockW / 2, SLIDE.marginX + CONTENT_W - blockW + 0.05)
    );

    // 軸上のドットと破線コネクタ
    slide.addShape(ShapeType.ellipse, {
      x: cx - 0.085, y: lineY - 0.085, w: 0.17, h: 0.17,
      fill: { color: "5E9475" }, line: { type: "none" },
    });
    slide.addShape(ShapeType.line, {
      x: cx, y: above ? lineY - 0.42 : lineY + 0.09,
      w: 0, h: 0.33,
      line: { color: LINE_COLOR, width: 1.25, dashType: "dash" },
    });

    // 画像スロット（ブロック左）
    const imgS = 1.1;
    const { imgPath, label } = resolveImage(ctx, step.image);
    addImageSlot(slide, {
      x: bx, y: by + (blockH - imgS) / 2 - 0.1, w: imgS, h: imgS,
      imgPath, label,
    });

    // STEP バッジ（淡色円 + STEPn）
    const badgeD = 0.62;
    const tx = bx + imgS + 0.18;
    slide.addShape(ShapeType.ellipse, {
      x: tx, y: by + 0.06, w: badgeD, h: badgeD,
      fill: { color: pal.fill }, line: { type: "none" },
    });
    slide.addText(`STEP\n${i + 1}`, {
      x: tx, y: by + 0.06, w: badgeD, h: badgeD,
      fontFace: FONT.body, fontSize: 9, bold: true, color: pal.strong,
      align: "center", valign: "middle", lineSpacingMultiple: 1.0,
    });
    slide.addText(step.label, {
      x: tx + badgeD + 0.12, y: by + 0.06, w: blockW - imgS - badgeD - 0.42, h: badgeD,
      fontFace: FONT.body, fontSize: 13, bold: true, color: COLORS.text,
      align: "left", valign: "middle", lineSpacingMultiple: 1.1,
    });
    if (step.description) {
      slide.addText(step.description, {
        x: tx, y: by + 0.06 + badgeD + 0.10, w: blockW - imgS - 0.28, h: blockH - badgeD - 0.3,
        fontFace: FONT.body, fontSize: 10, color: COLORS.text,
        align: "left", valign: "top", lineSpacingMultiple: 1.35,
      });
    }
  });
};
