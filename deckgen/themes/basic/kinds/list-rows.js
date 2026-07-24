// kind: list-rows — 少数の項目を 1 行ずつ全幅の帯で並べて強調する。
// 各行は「左端のアクセント色ブロック + アクセント色枠線の本体（白地）+ 左寄せテキスト」
// で構成される。items は 3〜5 件（厳守）。範囲外は警告プレースホルダを描画する。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle } = require("../parts");
const { ShapeType } = require("../../../core/engine");

const MIN_ITEMS = 3;
const MAX_ITEMS = 5;

// 行の寸法。5 行 + 行間 4 つで contentH (4.85) にほぼ収まる値
// （5 × 0.76 + 4 × 0.25 = 4.80）。行数が少ない場合は行群ごと垂直中央に寄せる。
const ROW_H = 0.76;
const ROW_GAP = 0.25;
// 左端のアクセントブロック幅
const BLOCK_W = 0.80;
// ブロック右端からテキストまでの余白
const TEXT_PAD = 0.35;

module.exports = function renderListRows(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.items.length;
  if (n < MIN_ITEMS || n > MAX_ITEMS) {
    slide.addText(`list-rows: items は ${MIN_ITEMS}〜${MAX_ITEMS} 件（現在 ${n} 件）`, {
      x: 1, y: 3, w: 11, h: 1,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.todo.size, color: COLORS.negBorder,
    });
    return;
  }
  const totalH = n * ROW_H + (n - 1) * ROW_GAP;
  const y0 = SLIDE.contentY + (SLIDE.contentH - totalH) / 2;
  spec.items.forEach((text, i) => {
    const y = y0 + i * (ROW_H + ROW_GAP);
    // 本体（全幅・白地・アクセント枠）
    slide.addShape(ShapeType.rect, {
      x: SLIDE.marginX, y, w: CONTENT_W, h: ROW_H,
      fill: { color: COLORS.bg },
      line: { color: COLORS.accent, width: 1.0 },
    });
    // 左端のアクセントブロック（本体の枠線の上に重ねる）と連番
    slide.addShape(ShapeType.rect, {
      x: SLIDE.marginX, y, w: BLOCK_W, h: ROW_H,
      fill: { color: COLORS.accent },
      line: { type: "none" },
    });
    slide.addText(String(i + 1), {
      x: SLIDE.marginX, y, w: BLOCK_W, h: ROW_H,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.listRowNumber.size,
      bold: TYPOGRAPHY.listRowNumber.bold,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
    });
    slide.addText(text, {
      x: SLIDE.marginX + BLOCK_W + TEXT_PAD,
      y,
      w: CONTENT_W - BLOCK_W - TEXT_PAD * 2,
      h: ROW_H,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.listRow.size,
      color: COLORS.text,
      valign: "middle",
    });
  });
};
