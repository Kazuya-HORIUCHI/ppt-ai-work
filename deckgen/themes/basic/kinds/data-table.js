// kind: data-table — タイトル + 表 + 任意の注記。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle, addTable } = require("../parts");

module.exports = function renderDataTable(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  addTable(
    slide,
    spec.header,
    spec.rows,
    SLIDE.marginX,
    SLIDE.contentY,
    CONTENT_W,
    { colW: spec.colW, rowH: spec.rowH, fontSize: spec.fontSize }
  );
  if (spec.note) {
    const noteStyle =
      spec.note.style === "small" ? TYPOGRAPHY.noteSmall : TYPOGRAPHY.noteMedium;
    const noteGap = spec.note.gap ?? 0.25;
    const totalRows = spec.rows.length + 1; // header 行を含む
    slide.addText(spec.note.text, {
      x: SLIDE.marginX,
      y: SLIDE.contentY + spec.rowH * totalRows + noteGap,
      w: CONTENT_W, h: 0.4,
      fontFace: FONT.body, fontSize: noteStyle.size, color: COLORS.muted,
    });
  }
};
