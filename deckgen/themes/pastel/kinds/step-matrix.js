// kind: step-matrix — 左に STEP カードの階段、右に列（料金 / 内容 / 目的 等）を持つ
// 段階型の商品化・工程比較テーブル。下部に任意の注記帯を置く。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addDotBullets, addSummaryBand } = require("../parts");
const { palette, drawHeader } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const STEP_W = 3.35;
const GAP = 0.14;
const HEADER_H = 0.38;
const NOTE_H = 0.62;
const ROW_GAP = 0.18;

module.exports = function renderStepMatrix(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const nCols = spec.columns.length;
  const colWs = allocColumnWidths(spec.columns, nCols);
  const colX = (i) =>
    SLIDE.marginX + STEP_W + GAP + colWs.slice(0, i).reduce((a, b) => a + b + GAP, 0);

  // 列見出し帯
  spec.columns.forEach((col, i) => {
    const title = typeof col === "string" ? col : col.title;
    addRoundBox(slide, colX(i), SLIDE.contentY, colWs[i], HEADER_H, {
      fillColor: COLORS.bandFill,
      rectRadius: 0.06,
    });
    slide.addText(title, {
      x: colX(i), y: SLIDE.contentY, w: colWs[i], h: HEADER_H,
      fontFace: FONT.body, fontSize: 11.5, bold: true,
      color: COLORS.accentDark, align: "center", valign: "middle",
    });
  });

  const hasNote = !!spec.note;
  const n = spec.steps.length;
  const rowsTop = SLIDE.contentY + HEADER_H + GAP;
  const rowsH =
    SLIDE.contentH - HEADER_H - GAP - (hasNote ? NOTE_H + 0.15 : 0);
  const rowH = (rowsH - ROW_GAP * (n - 1)) / n;

  spec.steps.forEach((step, r) => {
    const pal = palette(r, step.variant);
    const y = rowsTop + r * (rowH + ROW_GAP);

    // STEP カード（白地 + パレット枠 + バッジ円 + ラベル + 補足）
    addRoundBox(slide, SLIDE.marginX, y, STEP_W, rowH, {
      fillColor: COLORS.bg,
      borderColor: pal.border,
      borderWidth: 1,
      rectRadius: 0.07,
    });
    const badgeD = Math.min(0.52, rowH - 0.16);
    slide.addShape(ShapeType.ellipse, {
      x: SLIDE.marginX + 0.14, y: y + (rowH - badgeD) / 2, w: badgeD, h: badgeD,
      fill: { color: pal.strong }, line: { type: "none" },
    });
    slide.addText(`STEP\n${r + 1}`, {
      x: SLIDE.marginX + 0.14, y: y + (rowH - badgeD) / 2, w: badgeD, h: badgeD,
      fontFace: FONT.body, fontSize: 7.5, bold: true, color: "FFFFFF",
      align: "center", valign: "middle", lineSpacingMultiple: 0.95,
    });
    slide.addText(step.label, {
      x: SLIDE.marginX + 0.78, y: y + 0.05, w: STEP_W - 0.95, h: rowH * 0.55 - 0.05,
      fontFace: FONT.body, fontSize: 12.5, bold: true,
      color: pal.strong, align: "left", valign: "middle",
    });
    if (step.sublabel) {
      slide.addText(step.sublabel, {
        x: SLIDE.marginX + 0.78, y: y + rowH * 0.52, w: STEP_W - 0.95, h: rowH * 0.44,
        fontFace: FONT.body, fontSize: 9, color: COLORS.subText,
        align: "left", valign: "top",
      });
    }
    // STEP 間の下向き矢印
    if (r < n - 1) {
      slide.addShape(ShapeType.downArrow, {
        x: SLIDE.marginX + STEP_W / 2 - 0.11, y: y + rowH + 0.015, w: 0.22, h: ROW_GAP - 0.03,
        fill: { color: COLORS.arrow }, line: { type: "none" },
      });
    }

    // セル
    step.cells.forEach((cell, c) => {
      const x = colX(c);
      addRoundBox(slide, x, y, colWs[c], rowH, {
        fillColor: COLORS.bg,
        borderColor: COLORS.border,
        borderWidth: 0.75,
        rectRadius: 0.05,
      });
      if (Array.isArray(cell)) {
        addDotBullets(slide, cell, x + 0.14, y + 0.08, colWs[c] - 0.26, rowH - 0.16, {
          style: { size: 9, lineSpacing: 1.2, paraSpaceAfterPt: 2 },
          size: 9,
        });
      } else if (cell) {
        slide.addText(cell, {
          x: x + 0.10, y, w: colWs[c] - 0.2, h: rowH,
          fontFace: FONT.body, fontSize: 10, color: COLORS.text,
          align: "center", valign: "middle", lineSpacingMultiple: 1.2,
        });
      }
    });
  });

  if (hasNote) {
    addSummaryBand(slide, SLIDE.contentY + SLIDE.contentH - NOTE_H, NOTE_H, spec.note, {
      size: 11.5,
    });
  }
};

// 列幅の配分。2 列目（内容など）を広く取る参照デザインの比率をベースに、
// 列数 2〜4 へ一般化する。
function allocColumnWidths(columns, nCols) {
  const totalW = CONTENT_W - STEP_W - GAP - GAP * (nCols - 1);
  const ratios = {
    1: [1],
    2: [0.42, 0.58],
    3: [0.2, 0.52, 0.28],
    4: [0.18, 0.4, 0.22, 0.2],
  }[nCols] || Array(nCols).fill(1 / nCols);
  return ratios.map((r) => totalW * r);
}
