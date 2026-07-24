// kind: mapping-rows — 左列（課題等）→ 右列（解決策等）の行対応レイアウト。
// 左右それぞれに見出し帯を置き、同じ行数（2〜4）の番号付きボックスを
// 行ごとの矢印で対応付ける。各行は任意の画像スロットを右端に持つ。
const { COLORS, FONT, SLIDE, CONTENT_W, PALETTE, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addDotBullets, addImageSlot } = require("../parts");
const { palette, resolveImage, drawHeader } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const ARROW_ZONE = 0.78;
const HEADER_H = 0.44;
const ROW_GAP = 0.14;

module.exports = function renderMappingRows(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const colW = (CONTENT_W - ARROW_ZONE) / 2;
  const leftX = SLIDE.marginX;
  const rightX = SLIDE.marginX + colW + ARROW_ZONE;
  const n = spec.left.rows.length;

  // 列見出し帯（左: 淡桃 / 右: 淡青）
  drawColHeader(slide, leftX, colW, spec.left.title, PALETTE[2]);
  drawColHeader(slide, rightX, colW, spec.right.title, PALETTE[0]);

  const rowsTop = SLIDE.contentY + HEADER_H + 0.18;
  const rowsH = SLIDE.contentY + SLIDE.contentH - rowsTop;
  const rowH = (rowsH - ROW_GAP * (n - 1)) / n;

  for (let i = 0; i < n; i++) {
    const y = rowsTop + i * (rowH + ROW_GAP);
    const pal = palette(i, spec.left.rows[i].variant);
    drawRowBox(slide, ctx, leftX, y, colW, rowH, spec.left.rows[i], pal, i + 1);
    drawRowBox(slide, ctx, rightX, y, colW, rowH, spec.right.rows[i], PALETTE[0], i + 1);
    slide.addShape(ShapeType.rightArrow, {
      x: leftX + colW + 0.10,
      y: y + rowH / 2 - 0.20,
      w: ARROW_ZONE - 0.20,
      h: 0.40,
      fill: { color: pal.border },
      line: { type: "none" },
    });
  }
};

function drawColHeader(slide, x, w, title, pal) {
  addRoundBox(slide, x, SLIDE.contentY, w, HEADER_H, {
    fillColor: pal.fill,
    rectRadius: 0.07,
  });
  slide.addText(title, {
    x, y: SLIDE.contentY, w, h: HEADER_H,
    fontFace: FONT.body, fontSize: 13, bold: true,
    color: pal.strong, align: "center", valign: "middle",
  });
}

function drawRowBox(slide, ctx, x, y, w, h, row, pal, num) {
  addRoundBox(slide, x, y, w, h, {
    fillColor: COLORS.bg,
    borderColor: pal.border,
    borderWidth: 1,
    rectRadius: 0.06,
  });
  // 番号バッジ
  const badgeD = 0.34;
  slide.addShape(ShapeType.ellipse, {
    x: x + 0.16, y: y + 0.12, w: badgeD, h: badgeD,
    fill: { color: pal.strong }, line: { type: "none" },
  });
  slide.addText(String(num), {
    x: x + 0.16, y: y + 0.12, w: badgeD, h: badgeD,
    fontFace: FONT.body, fontSize: 11, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  slide.addText(row.title, {
    x: x + 0.60, y: y + 0.08, w: w - 1.7, h: 0.4,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: pal.strong, align: "left", valign: "middle",
  });

  // 本文（配列 → ・箇条書き / 文字列 → 段落）
  const bodyY = y + 0.50;
  const bodyH = h - 0.60;
  const bodyW = w - 1.55;
  if (Array.isArray(row.body)) {
    addDotBullets(slide, row.body, x + 0.30, bodyY, bodyW, bodyH, {
      style: { size: TYPOGRAPHY.rowBody.size, lineSpacing: TYPOGRAPHY.rowBody.lineSpacing, paraSpaceAfterPt: 3 },
      size: TYPOGRAPHY.rowBody.size,
    });
  } else if (row.body) {
    slide.addText(row.body, {
      x: x + 0.30, y: bodyY, w: bodyW, h: bodyH,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.rowBody.size,
      color: COLORS.text, align: "left", valign: "top",
      lineSpacingMultiple: TYPOGRAPHY.rowBody.lineSpacing,
    });
  }

  // 行の画像スロット（右端）
  const imgS = Math.min(h - 0.24, 0.92);
  const { imgPath, label } = resolveImage(ctx, row.image);
  addImageSlot(slide, {
    x: x + w - imgS - 0.15,
    y: y + (h - imgS) / 2,
    w: imgS,
    h: imgS,
    imgPath,
    label,
  });
}
