// kind: contact — クロージング / 連絡先スライド。
// 左: バー付き見出し + リード文 + 連絡先ボックス（ラベル + 値の行、任意の QR 画像スロット）
// 右: 大きな画像スロット。下部: 呼びかけ帯（任意）。
const { COLORS, FONT, SLIDE, HEADER } = require("../tokens");
const { addRoundBox, addImageSlot, addSummaryBand } = require("../parts");
const { resolveImage, drawImage } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

module.exports = function renderContact(slide, spec, ctx) {
  const leftX = SLIDE.marginX;
  const leftW = 6.1;
  const rightX = leftX + leftW + 0.45;
  const rightW = SLIDE.width - SLIDE.marginX - rightX;
  const hasFooter = !!spec.footer;
  const bottomY = hasFooter ? 6.15 : 6.95;

  // 見出し（左バー + 2 行まで）
  slide.addShape(ShapeType.rect, {
    x: leftX, y: 0.52, w: HEADER.barW, h: 1.05,
    fill: { color: COLORS.accent }, line: { type: "none" },
  });
  slide.addText(spec.heading, {
    x: leftX + 0.28, y: 0.42, w: leftW - 0.28, h: 1.25,
    fontFace: FONT.body, fontSize: 20, bold: true,
    color: COLORS.text, align: "left", valign: "middle",
    lineSpacingMultiple: 1.35,
  });

  // リード文
  if (spec.lead) {
    slide.addText(spec.lead, {
      x: leftX + 0.05, y: 1.95, w: leftW - 0.2, h: 1.5,
      fontFace: FONT.body, fontSize: 12.5, color: COLORS.text,
      align: "left", valign: "top", lineSpacingMultiple: 1.55,
    });
  }

  // 連絡先ボックス（淡黄 + ラベル/値の行 + QR スロット）
  const boxY = 3.55;
  const boxH = bottomY - boxY - 0.25;
  addRoundBox(slide, leftX, boxY, leftW, boxH, {
    fillColor: COLORS.boxYellow,
    rectRadius: 0.12,
  });
  const rows = spec.contact && spec.contact.rows ? spec.contact.rows : [];
  const hasQr = spec.contact && spec.contact.qr;
  const qrS = Math.min(boxH - 0.4, 1.5);
  const rowAreaW = leftW - 0.5 - (hasQr ? qrS + 0.4 : 0);
  const rowH = (boxH - 0.3) / Math.max(1, rows.length);
  rows.forEach((row, i) => {
    const ry = boxY + 0.15 + i * rowH;
    slide.addText(
      [
        { text: `${row.label}  `, options: { bold: true, color: COLORS.text } },
        { text: row.value, options: { color: COLORS.accent, bold: true } },
      ],
      {
        x: leftX + 0.35, y: ry, w: rowAreaW, h: rowH,
        fontFace: FONT.body, fontSize: 13,
        align: "left", valign: "middle",
      }
    );
    if (i < rows.length - 1) {
      slide.addShape(ShapeType.line, {
        x: leftX + 0.35, y: ry + rowH, w: rowAreaW - 0.2, h: 0,
        line: { color: "E0D6B4", width: 0.75, dashType: "dash" },
      });
    }
  });
  if (hasQr) {
    const { imgPath, label } = resolveImage(ctx, spec.contact.qr);
    addImageSlot(slide, {
      x: leftX + leftW - qrS - 0.3,
      y: boxY + (boxH - qrS) / 2,
      w: qrS, h: qrS,
      imgPath, label: label || "QR コード",
    });
  }

  // 右: 大画像スロット
  drawImage(slide, ctx, spec.image, {
    x: rightX, y: 0.6, w: rightW, h: bottomY - 0.85,
  });

  // 下部の呼びかけ帯
  if (hasFooter) {
    addSummaryBand(slide, bottomY + 0.1, 0.72, spec.footer, { size: 13 });
  }
};
