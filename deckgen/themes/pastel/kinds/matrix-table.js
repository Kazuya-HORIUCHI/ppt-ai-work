// kind: matrix-table — 属性行 × 案（プラン）列の比較マトリクス。
// 左端に属性ラベル列（アイコンスロット付き）、上端に列見出し帯、
// セルは短文 / 箇条書き / 画像スロット付きテキストを受け付ける。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addDotBullets, addImageSlot } = require("../parts");
const { palette, resolveImage, drawHeader } = require("./_shared");
const { visualCharWidth } = require("../../../core/text-metrics");

const LABEL_W = 2.15;
const GAP = 0.12;
const HEADER_H = 0.48;

module.exports = function renderMatrixTable(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const nCols = spec.columns.length;
  const colW = (CONTENT_W - LABEL_W - GAP * nCols) / nCols;
  const colX = (i) => SLIDE.marginX + LABEL_W + GAP + i * (colW + GAP);

  // 列見出し帯（番号丸 + タイトル）
  spec.columns.forEach((col, i) => {
    const pal = palette(i, col.variant);
    addRoundBox(slide, colX(i), SLIDE.contentY, colW, HEADER_H, {
      fillColor: pal.fill,
      rectRadius: 0.07,
    });
    slide.addText(`${i + 1}  ${col.title}`, {
      x: colX(i), y: SLIDE.contentY, w: colW, h: HEADER_H,
      fontFace: FONT.body, fontSize: 12.5, bold: true,
      color: pal.strong, align: "center", valign: "middle",
    });
  });

  // 行高の見積もり（セルの折り返し行数から）
  const cellCharW = (TYPOGRAPHY.cellBody.size / 72) * 1.07;
  const rowHeights = spec.rows.map((row) => {
    let maxLines = 1;
    let hasImage = false;
    row.cells.forEach((cellRaw) => {
      const cell = normalizeCell(cellRaw);
      if (cell.image) hasImage = true;
      const innerW = colW - 0.3 - (cell.image ? 0.85 : 0);
      const charsPerLine = Math.max(4, Math.floor(innerW / cellCharW));
      const texts = cell.items || [cell.text || ""];
      const lines = texts.reduce(
        (acc, t) => acc + Math.max(1, Math.ceil(visualCharWidth(t) / charsPerLine)),
        0
      );
      maxLines = Math.max(maxLines, lines);
    });
    return Math.max(0.52, maxLines * 0.215 + 0.22, hasImage ? 0.9 : 0);
  });

  // 収まらない場合は全行を等比で圧縮（微超過は許容し、README の行数制約で防ぐ）
  const rowsTop = SLIDE.contentY + HEADER_H + GAP;
  const availH = SLIDE.contentY + SLIDE.contentH - rowsTop;
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + GAP * (spec.rows.length - 1);
  const scale = Math.min(1, (availH - GAP * (spec.rows.length - 1)) / (totalH - GAP * (spec.rows.length - 1)));

  let y = rowsTop;
  spec.rows.forEach((row, r) => {
    const rowH = rowHeights[r] * scale;

    // 属性ラベルセル（淡青 + アイコンスロット）
    addRoundBox(slide, SLIDE.marginX, y, LABEL_W, rowH, {
      fillColor: "EDF3F8",
      rectRadius: 0.06,
    });
    if (row.icon) {
      const iconS = Math.min(0.42, rowH - 0.2);
      const { imgPath, label } = resolveImage(ctx, row.icon);
      addImageSlot(slide, {
        x: SLIDE.marginX + 0.14,
        y: y + (rowH - iconS) / 2,
        w: iconS, h: iconS,
        imgPath, label: label || "icon",
      });
    }
    slide.addText(row.label, {
      x: SLIDE.marginX + (row.icon ? 0.64 : 0.2),
      y, w: LABEL_W - (row.icon ? 0.75 : 0.35), h: rowH,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.rowLabel.size, bold: true,
      color: COLORS.accentDark, align: "left", valign: "middle",
    });

    // 本体セル
    row.cells.forEach((cellRaw, c) => {
      const cell = normalizeCell(cellRaw);
      const x = colX(c);
      addRoundBox(slide, x, y, colW, rowH, {
        fillColor: COLORS.bg,
        borderColor: COLORS.border,
        borderWidth: 0.75,
        rectRadius: 0.05,
      });
      const imgS = Math.min(rowH - 0.16, 0.8);
      const textW = colW - 0.3 - (cell.image ? imgS + 0.15 : 0);
      if (cell.items) {
        addDotBullets(slide, cell.items, x + 0.16, y + 0.10, textW, rowH - 0.2, {
          style: { size: TYPOGRAPHY.cellBody.size, lineSpacing: TYPOGRAPHY.cellBody.lineSpacing, paraSpaceAfterPt: 2 },
          size: TYPOGRAPHY.cellBody.size,
        });
      } else if (cell.text) {
        slide.addText(cell.text, {
          x: x + 0.16, y, w: textW, h: rowH,
          fontFace: FONT.body, fontSize: TYPOGRAPHY.cellBody.size,
          color: COLORS.text, align: "left", valign: "middle",
          lineSpacingMultiple: TYPOGRAPHY.cellBody.lineSpacing,
        });
      }
      if (cell.image) {
        const { imgPath, label } = resolveImage(ctx, cell.image);
        addImageSlot(slide, {
          x: x + colW - imgS - 0.12,
          y: y + (rowH - imgS) / 2,
          w: imgS, h: imgS,
          imgPath, label,
        });
      }
    });

    y += rowH + GAP;
  });
};

// セルは string | string[] | { text?, items?, image? } を受け付ける。
function normalizeCell(cell) {
  if (typeof cell === "string") return { text: cell };
  if (Array.isArray(cell)) return { items: cell };
  return cell || {};
}
