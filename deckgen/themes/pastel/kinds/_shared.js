// themes/pastel/kinds/_shared.js
// pastel テーマの kind 実装間で共有する配置ロジック・spec 解釈ヘルパー。

const fs = require("fs");
const path = require("path");
const { PALETTE } = require("../tokens");
const { addHeader, addImageSlot } = require("../parts");

// パレットのローテーション（カード i 枚目 → 淡青 / 淡黄 / 淡桃 / 淡緑 / 淡紫）。
// spec 側で variant（パレット key 名）が指定されていればそれを優先する。
function palette(i, variantKey) {
  if (variantKey) {
    const found = PALETTE.find((p) => p.key === variantKey);
    if (found) return found;
  }
  return PALETTE[i % PALETTE.length];
}

// spec.image ({ src?, label? }) を addImageSlot 用の引数に解決する。
// src が未指定 or ファイルが存在しない場合は imgPath: null（= プレースホルダ描画）。
// ファイル欠落はラベルで気づけるよう「(not found)」を付ける。
function resolveImage(ctx, image) {
  if (!image) return { imgPath: null, label: undefined };
  let imgPath = null;
  let label = image.label;
  if (image.src) {
    const abs = path.resolve(ctx.deckDir, image.src);
    if (fs.existsSync(abs)) {
      imgPath = abs;
    } else {
      label = `${image.label || image.src} (not found)`;
    }
  }
  return { imgPath, label };
}

// spec.image をそのまま画像スロットとして描く便利ラッパー。
function drawImage(slide, ctx, image, box) {
  const { imgPath, label } = resolveImage(ctx, image);
  addImageSlot(slide, { ...box, imgPath, label });
}

// コンテンツスライドの通し番号を返す（直近の section-divider 以降で何枚目か）。
// 参照デザインの「丸バッジ数字」を deck 側に書かせず自動で振るために使う。
function contentNumber(deck, spec) {
  let n = 0;
  for (const s of deck.slides) {
    if (s.kind === "title-slide" || s.kind === "section-divider") {
      n = 0;
      if (s === spec) return null;
      continue;
    }
    n += 1;
    if (s === spec) return n;
  }
  return null;
}

// 標準ヘッダ描画。spec.header === "bar" なら縦バー見出し、それ以外は番号バッジ見出し。
function drawHeader(slide, spec, ctx) {
  if (spec.header === "bar") {
    addHeader(slide, spec.title, spec.message, {});
  } else {
    addHeader(slide, spec.title, spec.message, {
      badgeNumber: contentNumber(ctx.deck, spec) || 1,
    });
  }
}

module.exports = {
  palette,
  resolveImage,
  drawImage,
  contentNumber,
  drawHeader,
};
