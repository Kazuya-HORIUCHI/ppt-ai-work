// kind: hub-spokes — 中央ハブ（円形画像 + 名称）の周囲にロールカードを配置する募集・体制図。
// 参照デザインの放射レイアウトを、固定スロット（上 1 / 左 3 / 右 3）へ簡略化して近似する。
// spokes は最大 7 件。ヘッダは使わず、大きな見出しを中央上部に描く。
const { COLORS, FONT, SLIDE, TYPOGRAPHY } = require("../tokens");
const { addRoundBox } = require("../parts");
const { palette, drawImage } = require("./_shared");

// スロット座標（カード左上）。カードは 3.05 × 0.98 in。
const CARD_W = 3.05;
const CARD_H = 0.98;
const SLOTS = [
  { x: 5.14, y: 1.72 },  // 上
  { x: 9.35, y: 2.10 },  // 右上
  { x: 9.75, y: 3.22 },  // 右中
  { x: 9.42, y: 4.34 },  // 右下
  { x: 0.55, y: 2.10 },  // 左上
  { x: 0.15, y: 3.22 },  // 左中
  { x: 0.48, y: 4.34 },  // 左下
];
// spokes 配列の並び順（上 → 右上 → 左上 → 右中 → 左中 → 右下 → 左下）を
// 視覚スロットに割り当てる: 読み順と放射配置のバランスを取る。
const ORDER = [0, 1, 4, 2, 5, 3, 6];

module.exports = function renderHubSpokes(slide, spec, ctx) {
  // 大見出し（中央・2 行まで）+ リード
  slide.addText(spec.title, {
    x: 1.2, y: 0.28, w: SLIDE.width - 2.4, h: 1.0,
    fontFace: FONT.body, fontSize: 23, bold: true,
    color: COLORS.text, align: "center", valign: "middle",
    lineSpacingMultiple: 1.2,
  });
  if (spec.lead) {
    slide.addText(spec.lead, {
      x: 1.2, y: 1.28, w: SLIDE.width - 2.4, h: 0.38,
      fontFace: FONT.body, fontSize: 11.5, color: COLORS.subText,
      align: "center", valign: "top",
    });
  }

  // ハブ（円形画像スロット + 名称 + 補足）
  const d = 2.5;
  const cx = SLIDE.width / 2;
  drawImage(slide, ctx, spec.hub.image, {
    x: cx - d / 2, y: 2.72, w: d, h: d, shape: "circle",
  });
  slide.addText(spec.hub.title, {
    x: cx - 2.2, y: 5.28, w: 4.4, h: 0.42,
    fontFace: FONT.body, fontSize: 16, bold: true,
    color: COLORS.text, align: "center", valign: "middle", charSpacing: 3,
  });
  if (spec.hub.subtitle) {
    slide.addText(spec.hub.subtitle, {
      x: cx - 2.6, y: 5.72, w: 5.2, h: 0.6,
      fontFace: FONT.body, fontSize: 10, color: COLORS.subText,
      align: "center", valign: "top", lineSpacingMultiple: 1.3,
    });
  }

  // スポークカード
  spec.spokes.slice(0, SLOTS.length).forEach((spoke, i) => {
    const slot = SLOTS[ORDER[i] != null ? ORDER[i] : i];
    const pal = palette(i, spoke.variant);
    addRoundBox(slide, slot.x, slot.y, CARD_W, CARD_H, {
      fillColor: pal.fill,
      rectRadius: 0.16,
    });
    const iconS = 0.62;
    drawImage(slide, ctx, spoke.image, {
      x: slot.x + 0.16, y: slot.y + (CARD_H - iconS) / 2, w: iconS, h: iconS,
      shape: "circle",
    });
    slide.addText(spoke.title, {
      x: slot.x + 0.92, y: slot.y + 0.10, w: CARD_W - 1.05, h: 0.30,
      fontFace: FONT.body, fontSize: 11.5, bold: true,
      color: pal.strong, align: "left", valign: "middle",
    });
    if (spoke.description) {
      slide.addText(spoke.description, {
        x: slot.x + 0.92, y: slot.y + 0.40, w: CARD_W - 1.05, h: CARD_H - 0.5,
        fontFace: FONT.body, fontSize: 8.5, color: COLORS.text,
        align: "left", valign: "top", lineSpacingMultiple: 1.25,
      });
    }
  });

  // 下部の呼びかけ帯（白地 + 枠線）
  if (spec.footer) {
    addRoundBox(slide, SLIDE.marginX, 6.5, SLIDE.width - SLIDE.marginX * 2, 0.72, {
      fillColor: COLORS.bg,
      borderColor: COLORS.border,
      borderWidth: 1,
      rectRadius: 0.3,
    });
    slide.addText(spec.footer, {
      x: SLIDE.marginX + 0.3, y: 6.5, w: SLIDE.width - SLIDE.marginX * 2 - 0.6, h: 0.72,
      fontFace: FONT.body, fontSize: 13.5, bold: true,
      color: COLORS.text, align: "center", valign: "middle",
    });
  }
};
