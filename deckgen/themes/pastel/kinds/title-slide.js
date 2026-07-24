// kind: title-slide — 表紙。中央揃えの主見出し + リボン下線 + サブタイトル。
const { COLORS, FONT, SLIDE, TYPOGRAPHY } = require("../tokens");
const { addRibbon } = require("../parts");

module.exports = function renderTitleSlide(slide, spec, ctx) {
  const meta = ctx.deck.meta;
  slide.background = { color: COLORS.bg };
  const cx = SLIDE.width / 2;

  if (meta.eyebrow) {
    slide.addText(meta.eyebrow, {
      x: 0.9, y: 2.05, w: SLIDE.width - 1.8, h: 0.5,
      fontFace: FONT.body, fontSize: 15, bold: true,
      color: COLORS.accent, align: "center",
    });
  }
  slide.addText(meta.heading, {
    x: 0.9, y: 2.55, w: SLIDE.width - 1.8, h: 1.4,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.titleSlideHeading.size,
    bold: TYPOGRAPHY.titleSlideHeading.bold,
    color: COLORS.text,
    align: "center",
    valign: "middle",
    lineSpacingMultiple: TYPOGRAPHY.titleSlideHeading.lineSpacing,
  });
  addRibbon(slide, cx, 4.05, 9.6);
  if (meta.subtitle) {
    slide.addText(meta.subtitle, {
      x: 0.9, y: 4.35, w: SLIDE.width - 1.8, h: 0.55,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideSubtitle.size,
      color: COLORS.subText, align: "center",
    });
  }
  if (meta.meta) {
    slide.addText(meta.meta, {
      x: 0.9, y: 6.7, w: SLIDE.width - 1.8, h: 0.3,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideMeta.size,
      color: COLORS.muted, align: "center",
    });
  }
};
