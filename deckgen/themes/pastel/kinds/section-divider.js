// kind: section-divider — 章扉。「Part N タイトル」を中央 1 行 + リボン下線 + サブタイトル。
// pastel テーマは basic の { label, title } に加えて任意の subtitle を受け付ける。
const { COLORS, FONT, SLIDE, TYPOGRAPHY } = require("../tokens");
const { addRibbon } = require("../parts");

module.exports = function renderSectionDivider(slide, spec) {
  slide.background = { color: COLORS.bg };
  const cx = SLIDE.width / 2;
  const line = spec.label ? `${spec.label}  ${spec.title}` : spec.title;

  slide.addText(line, {
    x: 0.9, y: 2.65, w: SLIDE.width - 1.8, h: 1.1,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.dividerTitle.size,
    bold: TYPOGRAPHY.dividerTitle.bold,
    color: COLORS.text,
    align: "center",
    valign: "middle",
  });
  addRibbon(slide, cx, 3.85, 6.4);
  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: 0.9, y: 4.15, w: SLIDE.width - 1.8, h: 0.5,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.dividerSubtitle.size,
      color: COLORS.muted,
      align: "center",
      charSpacing: 2,
    });
  }
};
