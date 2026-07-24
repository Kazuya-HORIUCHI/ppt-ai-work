// themes/pastel/parts.js
// pastel テーマの低レベル描画パーツ。
// deck.js の spec 構造は知らない（素の引数のみで動く）。spec の解釈は kinds/ 側の責務。

const {
  COLORS,
  FONT,
  SLIDE,
  CONTENT_W,
  HEADER,
  IMAGE_SLOT,
  TYPOGRAPHY,
} = require("./tokens");
const tokens = require("./tokens");
const { estimateBodyHeight: coreEstimateBodyHeight } = require("../../core/text-metrics");
const { ShapeType } = require("../../core/engine");

function estimateBodyHeight(body, innerW) {
  return coreEstimateBodyHeight(body, innerW, tokens);
}

// ---------- ヘッダ ----------
// 番号バッジ（淡青の円 + 数字）+ 左寄せタイトル + アクセント色メッセージ。
// opts.badgeNumber が無い場合は縦バー（参照デザインのバー付き見出し）に切り替える。
function addHeader(slide, title, message, opts = {}) {
  const titleX = SLIDE.marginX + HEADER.titleOffsetX;
  if (opts.badgeNumber != null) {
    slide.addShape(ShapeType.ellipse, {
      x: SLIDE.marginX,
      y: SLIDE.titleY + (SLIDE.titleH - HEADER.badgeD) / 2,
      w: HEADER.badgeD,
      h: HEADER.badgeD,
      fill: { color: COLORS.badgeFill },
      line: { type: "none" },
    });
    slide.addText(String(opts.badgeNumber), {
      x: SLIDE.marginX,
      y: SLIDE.titleY + (SLIDE.titleH - HEADER.badgeD) / 2,
      w: HEADER.badgeD,
      h: HEADER.badgeD,
      fontFace: FONT.body,
      fontSize: HEADER.badgeTextSize,
      color: COLORS.accentDark,
      align: "center",
      valign: "middle",
    });
  } else {
    slide.addShape(ShapeType.rect, {
      x: SLIDE.marginX,
      y: SLIDE.titleY + 0.06,
      w: HEADER.barW,
      h: SLIDE.titleH - 0.12,
      fill: { color: COLORS.accent },
      line: { type: "none" },
    });
  }
  slide.addText(title, {
    x: titleX,
    y: SLIDE.titleY,
    w: SLIDE.width - titleX - SLIDE.marginX,
    h: SLIDE.titleH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.slideTitle.size,
    bold: TYPOGRAPHY.slideTitle.bold,
    color: COLORS.text,
    align: "left",
    valign: "middle",
  });
  if (message) {
    slide.addText(message, {
      x: titleX,
      y: SLIDE.messageY,
      w: SLIDE.width - titleX - SLIDE.marginX,
      h: SLIDE.messageH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.slideMessage.size,
      bold: TYPOGRAPHY.slideMessage.bold,
      color: COLORS.accent,
      align: "left",
      valign: "top",
      lineSpacingMultiple: 1.35,
    });
  }
}

// ---------- フッター ----------
function addFooter(slide, pageNumber, totalPages, sectionLabel) {
  if (sectionLabel) {
    slide.addText(sectionLabel, {
      x: SLIDE.sectionLabelX,
      y: SLIDE.sectionLabelY,
      w: CONTENT_W * 0.7,
      h: 0.25,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.footer.size,
      color: COLORS.muted,
    });
  }
  slide.addText(String(pageNumber), {
    x: SLIDE.width - SLIDE.pageNumRightInset - 1.0,
    y: SLIDE.footerY,
    w: 1.0,
    h: SLIDE.footerH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.footer.size,
    color: COLORS.muted,
    align: "right",
  });
}

function addUnimplementedPlaceholder(slide, kindName) {
  slide.addText(`未実装の kind: ${kindName}`, {
    x: 1, y: 3, w: 11, h: 1,
    fontFace: FONT.body, fontSize: TYPOGRAPHY.todo.size, color: "C0707F",
  });
}

// ---------- 画像スロット ----------
// imgPath があれば contain で埋め込み、無ければ破線枠 + ラベルのプレースホルダを描く。
// shape: "rect"（角丸矩形）| "circle"（円）。ringColor は placeholder 枠線の色を差し替える。
function addImageSlot(slide, { x, y, w, h, imgPath, shape = "rect", label, ringColor }) {
  if (imgPath) {
    slide.addImage({
      path: imgPath,
      x, y, w, h,
      sizing: { type: "contain", w, h },
    });
    return;
  }
  const border = ringColor || IMAGE_SLOT.borderColor;
  if (shape === "circle") {
    slide.addShape(ShapeType.ellipse, {
      x, y, w, h,
      fill: { color: IMAGE_SLOT.fill },
      line: { color: border, width: 0.75, dashType: "dash" },
    });
  } else {
    slide.addShape(ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: IMAGE_SLOT.fill },
      line: { color: border, width: 0.75, dashType: "dash" },
      rectRadius: 0.06,
    });
  }
  // 小さいスロットではラベルが枠外にあふれるため、描画を抑制する
  if (Math.min(w, h) < 0.55) return;
  slide.addText(label || "画像", {
    x, y, w, h,
    fontFace: FONT.body,
    fontSize: Math.min(w, h) < 1.0 ? 6.5 : IMAGE_SLOT.labelSize,
    color: COLORS.muted,
    align: "center",
    valign: "middle",
  });
}

// ---------- 汎用ボックス ----------
function addRoundBox(slide, x, y, w, h, opts = {}) {
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: opts.fillColor || COLORS.bgSubtle },
    line: opts.borderColor
      ? { color: opts.borderColor, width: opts.borderWidth || 0.75 }
      : { type: "none" },
    rectRadius: opts.rectRadius != null ? opts.rectRadius : 0.09,
  });
}

// ---------- 箇条書き（・マーカー、パステル調） ----------
function addDotBullets(slide, items, x, y, w, h, opts = {}) {
  const style = opts.style || TYPOGRAPHY.cardBullet;
  const arr = items.map((t) => ({
    text: t,
    options: {
      bullet: { code: "30FB" }, // ・
      paraSpaceAfter: style.paraSpaceAfterPt || 6,
      indent: 0,
    },
  }));
  slide.addText(arr, {
    x, y, w, h,
    fontFace: FONT.body,
    fontSize: opts.size || style.size,
    color: opts.color || COLORS.text,
    valign: opts.valign || "top",
    lineSpacingMultiple: style.lineSpacing,
    margin: 0,
  });
}

// ---------- 下部まとめ帯 ----------
// 淡青の角丸帯。左に任意の画像スロット、中央（または左寄せ）にテキスト。
function addSummaryBand(slide, y, h, text, opts = {}) {
  const x = SLIDE.marginX;
  const w = CONTENT_W;
  addRoundBox(slide, x, y, w, h, { fillColor: opts.fillColor || COLORS.bandFill });
  const hasImg = !!opts.imageSlot;
  const imgSize = Math.min(h - 0.24, 0.95);
  if (hasImg) {
    addImageSlot(slide, {
      x: x + 0.28,
      y: y + (h - imgSize) / 2,
      w: imgSize,
      h: imgSize,
      imgPath: opts.imageSlot.imgPath,
      label: opts.imageSlot.label,
      shape: opts.imageSlot.shape || "rect",
    });
  }
  const textX = hasImg ? x + 0.28 + imgSize + 0.30 : x + 0.45;
  slide.addText(text, {
    x: textX,
    y,
    w: x + w - 0.45 - textX,
    h,
    fontFace: FONT.body,
    fontSize: opts.size || TYPOGRAPHY.band.size,
    color: opts.color || COLORS.accentDark,
    align: opts.align || "center",
    valign: "middle",
    lineSpacingMultiple: TYPOGRAPHY.band.lineSpacing,
  });
}

// ---------- 表紙・章扉のリボン下線 ----------
function addRibbon(slide, cx, y, w) {
  slide.addShape(ShapeType.roundRect, {
    x: cx - w / 2,
    y,
    w,
    h: 0.11,
    fill: { color: COLORS.ribbon },
    line: { type: "none" },
    rectRadius: 0.055,
  });
}

module.exports = {
  estimateBodyHeight,
  addHeader,
  addFooter,
  addUnimplementedPlaceholder,
  addImageSlot,
  addRoundBox,
  addDotBullets,
  addSummaryBand,
  addRibbon,
};
