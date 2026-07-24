// kind: spec-rows — 「ラベル帯 + 内容 + 小画像スロット」の行を縦に並べる詳細仕様レイアウト。
// 参照デザインの「プラン案_N」ページ（ターゲット / 商品概要 / 価格 …）のテンプレ。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addDotBullets, addImageSlot } = require("../parts");
const { resolveImage, drawHeader } = require("./_shared");
const { visualCharWidth } = require("../../../core/text-metrics");

const LABEL_W = 2.5;
const GAP_X = 0.18;
const GAP_Y = 0.12;

module.exports = function renderSpecRows(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const n = spec.rows.length;
  const contentX = SLIDE.marginX + LABEL_W + GAP_X;
  const contentBoxW = CONTENT_W - LABEL_W - GAP_X;

  // 行高の配分: 行数ベースの見積もりを正規化して contentH に割り付ける
  const charW = (TYPOGRAPHY.cellBody.size / 72) * 1.07;
  const textW = contentBoxW - 1.35; // 右端の画像スロットぶんを差し引いた本文幅
  const weights = spec.rows.map((row) => {
    const texts = Array.isArray(row.text) ? row.text : [row.text || ""];
    const charsPerLine = Math.max(8, Math.floor(textW / charW));
    const lines = texts.reduce(
      (acc, t) => acc + Math.max(1, Math.ceil(visualCharWidth(t) / charsPerLine)),
      0
    );
    return Math.max(1, lines);
  });
  const availH = SLIDE.contentH - GAP_Y * (n - 1);
  const baseH = 0.30; // 1 行あたりの固定部（上下パディング相当）
  const flexH = availH - baseH * n;
  const totalW = weights.reduce((a, b) => a + b, 0);

  let y = SLIDE.contentY;
  spec.rows.forEach((row, i) => {
    const rowH = baseH + (flexH * weights[i]) / totalW;

    // ラベル帯（淡青の角丸 + アイコンスロット + ラベル）
    addRoundBox(slide, SLIDE.marginX, y, LABEL_W, rowH, {
      fillColor: "E3EDF5",
      rectRadius: 0.07,
    });
    const iconS = Math.min(0.44, rowH - 0.16);
    if (row.icon) {
      const { imgPath, label } = resolveImage(ctx, row.icon);
      addImageSlot(slide, {
        x: SLIDE.marginX + 0.18,
        y: y + (rowH - iconS) / 2,
        w: iconS, h: iconS,
        imgPath, label: label || "icon",
      });
    }
    slide.addText(row.label, {
      x: SLIDE.marginX + (row.icon ? 0.72 : 0.25),
      y, w: LABEL_W - (row.icon ? 0.85 : 0.4), h: rowH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.rowLabel.size,
      bold: true,
      color: COLORS.accentDark,
      align: "left",
      valign: "middle",
    });

    // 内容ボックス（白地 + 淡青枠）
    addRoundBox(slide, contentX, y, contentBoxW, rowH, {
      fillColor: COLORS.bg,
      borderColor: "BFD4E4",
      borderWidth: 0.75,
      rectRadius: 0.07,
    });
    const imgS = Math.min(rowH - 0.16, 0.85);
    if (Array.isArray(row.text)) {
      addDotBullets(slide, row.text, contentX + 0.28, y + 0.10, textW, rowH - 0.20, {
        style: { size: TYPOGRAPHY.cellBody.size, lineSpacing: 1.25, paraSpaceAfterPt: 2 },
        size: TYPOGRAPHY.cellBody.size,
      });
    } else if (row.text) {
      slide.addText(row.text, {
        x: contentX + 0.28, y, w: textW, h: rowH,
        fontFace: FONT.body,
        fontSize: 11,
        color: COLORS.text,
        align: "left",
        valign: "middle",
        lineSpacingMultiple: 1.3,
      });
    }
    if (row.image) {
      const { imgPath, label } = resolveImage(ctx, row.image);
      addImageSlot(slide, {
        x: contentX + contentBoxW - imgS - 0.15,
        y: y + (rowH - imgS) / 2,
        w: imgS, h: imgS,
        imgPath, label,
      });
    }

    y += rowH + GAP_Y;
  });
};
