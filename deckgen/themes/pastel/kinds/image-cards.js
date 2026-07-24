// kind: image-cards — タイトル + 画像スロット + 本文のパステルカードを 2〜4 枚並べる。
// 参照デザインの「創業の原点」「感じている課題感」「教材の特徴」「3種類の初期事業案」を
// 1 テンプレに統合したもの。オプションで次を切り替える:
//   flow: true            … カード間に右向き矢印（時系列・因果を示す）
//   cards[].body          … 箇条書き（配列・左寄せ）or キャプション（文字列・中央揃え）
//   cards[].conclusion    … カード下部の「▼ + 結論」強調
//   summary               … 下部まとめ帯（テキスト + 任意の画像スロット）
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addDotBullets, addSummaryBand, addImageSlot } = require("../parts");
const { palette, resolveImage, drawHeader } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const BAND_H = 1.05;

module.exports = function renderImageCards(slide, spec, ctx) {
  drawHeader(slide, spec, ctx);

  const n = spec.cards.length;
  const hasSummary = !!spec.summary;
  const areaY = SLIDE.contentY;
  const areaH = SLIDE.contentH - (hasSummary ? BAND_H + 0.25 : 0.05);
  const gap = spec.flow ? 0.52 : 0.32;
  const cardW = (CONTENT_W - gap * (n - 1)) / n;

  spec.cards.forEach((card, i) => {
    const pal = palette(i, card.variant);
    const x = SLIDE.marginX + i * (cardW + gap);
    addRoundBox(slide, x, areaY, cardW, areaH, {
      fillColor: pal.fill,
      borderColor: pal.border,
      rectRadius: 0.12,
    });

    // タイトル（カード上部・中央揃え・パレット強調色。2 行まで許容）
    slide.addText(card.title, {
      x: x + 0.15, y: areaY + 0.14, w: cardW - 0.3, h: 0.62,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.cardTitle.size,
      bold: true,
      color: pal.strong,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.15,
    });

    // 画像スロット（タイトル下・中央）。結論つきカードは本文域を確保するため縮小する
    const imgS = Math.min(cardW - 0.7, card.conclusion && hasSummary ? 1.15 : 1.55);
    const imgY = areaY + 0.84;
    const { imgPath, label } = resolveImage(ctx, card.image);
    addImageSlot(slide, {
      x: x + (cardW - imgS) / 2, y: imgY, w: imgS, h: imgS,
      imgPath, label,
    });

    // 結論（▼ + 強調テキスト）を持つ場合は下部に確保
    const conclusionH = card.conclusion ? 0.82 : 0;
    const bodyY = imgY + imgS + 0.14;
    const bodyH = Math.max(0.3, areaY + areaH - bodyY - conclusionH - 0.16);
    if (Array.isArray(card.body)) {
      addDotBullets(slide, card.body, x + 0.32, bodyY, cardW - 0.55, bodyH, {
        style: TYPOGRAPHY.cardBullet,
      });
    } else if (card.body) {
      slide.addText(card.body, {
        x: x + 0.24, y: bodyY, w: cardW - 0.48, h: bodyH,
        fontFace: FONT.body,
        fontSize: TYPOGRAPHY.cardCaption.size,
        color: COLORS.text,
        align: "center",
        valign: "top",
        lineSpacingMultiple: TYPOGRAPHY.cardCaption.lineSpacing,
      });
    }

    if (card.conclusion) {
      const cy = areaY + areaH - conclusionH;
      slide.addText("▼", {
        x: x, y: cy, w: cardW, h: 0.28,
        fontFace: FONT.body, fontSize: 11, color: pal.strong,
        align: "center", valign: "middle",
      });
      slide.addText(card.conclusion, {
        x: x + 0.15, y: cy + 0.28, w: cardW - 0.3, h: 0.44,
        fontFace: FONT.body,
        fontSize: TYPOGRAPHY.cardConclusion.size,
        bold: true,
        color: pal.strong,
        align: "center",
        valign: "top",
        lineSpacingMultiple: 1.15,
      });
    }

    // flow 矢印（画像スロットの高さ中央に合わせる）
    if (spec.flow && i < n - 1) {
      slide.addShape(ShapeType.rightArrow, {
        x: x + cardW + 0.08,
        y: imgY + imgS / 2 - 0.14,
        w: gap - 0.16,
        h: 0.28,
        fill: { color: COLORS.arrow },
        line: { type: "none" },
      });
    }
  });

  if (hasSummary) {
    const bandY = areaY + areaH + 0.25;
    const imageSlot = spec.summary.image
      ? { ...resolveImage(ctx, spec.summary.image) }
      : null;
    addSummaryBand(slide, bandY, BAND_H, spec.summary.text, {
      imageSlot,
    });
  }
};
