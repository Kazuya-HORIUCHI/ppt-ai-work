// kind: title-slide — 表紙。deck.meta の内容を描画する。
const { COLORS, FONT, SLIDE, TYPOGRAPHY } = require("../tokens");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderTitleSlide(slide, spec, ctx) {
  const meta = ctx.deck.meta;
  slide.background = { color: COLORS.bg };
  slide.addShape(ShapeType.rect, {
    x: 0, y: 0, w: 0.22, h: SLIDE.height,
    fill: { color: COLORS.accent }, line: { type: "none" },
  });
  if (meta.eyebrow) {
    slide.addText(meta.eyebrow, {
      x: 0.9, y: 2.0, w: 11.5, h: 0.6,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideEyebrow.size,
      color: COLORS.accent, bold: TYPOGRAPHY.titleSlideEyebrow.bold,
    });
  }
  slide.addText(meta.heading, {
    x: 0.9, y: 2.7, w: 11.5, h: 2.2,
    fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideHeading.size,
    color: COLORS.text, bold: TYPOGRAPHY.titleSlideHeading.bold,
    lineSpacingMultiple: TYPOGRAPHY.titleSlideHeading.lineSpacing,
  });
  slide.addShape(ShapeType.rect, {
    x: 0.9, y: 5.0, w: 0.6, h: 0.05,
    fill: { color: COLORS.accent }, line: { type: "none" },
  });
  if (meta.subtitle) {
    slide.addText(meta.subtitle, {
      x: 0.9, y: 5.15, w: 11.5, h: 0.5,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideSubtitle.size,
      color: COLORS.subText,
    });
  }
  if (meta.meta) {
    slide.addText(meta.meta, {
      x: 0.9, y: 6.7, w: 11.5, h: 0.3,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideMeta.size,
      color: COLORS.muted,
    });
  }
};
