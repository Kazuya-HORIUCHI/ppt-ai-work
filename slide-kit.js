// pptxgenjs ベースのスライド構築用 共通定数・ヘルパー群。
// 本ファイルは「資料の中身」には依存せず、レイアウト・配色・描画パーツのみを提供する。

const pptxgen = require("pptxgenjs");

// pptxgenjs v4 では ShapeType がインスタンス側にしか公開されていないため、
// モジュールロード時に空インスタンスを 1 つだけ生成して enum を取り出す。
const ShapeType = new pptxgen().ShapeType;

const COLORS = {
  bg: "FFFFFF",
  bgSubtle: "F9FAFB",
  text: "111827",
  subText: "4B5563",
  accent: "2563EB",
  accentLight: "EFF6FF",
  border: "D1D5DB",
  muted: "6B7280",
  posBg: "ECFDF5",
  posBorder: "10B981",
  negBg: "FEF2F2",
  negBorder: "EF4444",
};

const FONT = {
  body: "Yu Gothic",
};

const SLIDE = {
  width: 13.333,
  height: 7.5,
  marginX: 0.65,
  titleY: 0.45,
  titleH: 0.60,
  accentLineY: 1.06,
  accentLineH: 0.04,
  messageY: 1.40,
  messageH: 0.55,
  contentY: 2.05,
  contentH: 4.85,
  footerY: 7.05,
  footerH: 0.30,
};

const CONTENT_W = SLIDE.width - SLIDE.marginX * 2;

// 標準的な2カード左右レイアウトの寸法（contentY 起点、各カードの高さは内容に応じて算出）
const TWO_COL = {
  leftX: SLIDE.marginX,
  rightX: SLIDE.marginX + (CONTENT_W - 0.30) / 2 + 0.30,
  colW: (CONTENT_W - 0.30) / 2,
  y: SLIDE.contentY,
};

// カードの配色プリセット（addCard の opts に渡す）
const CARD_VARIANTS = {
  neg:    { fillColor: COLORS.negBg,       borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
  pos:    { fillColor: COLORS.posBg,       borderColor: COLORS.posBorder, titleColor: COLORS.posBorder },
  accent: { fillColor: COLORS.accentLight, borderColor: COLORS.accent,    titleColor: COLORS.accent    },
  gray:   { fillColor: COLORS.bgSubtle,    borderColor: COLORS.border,    titleColor: COLORS.text      },
};

// カード／ボックスの内側余白・本文高さ推定パラメータ（幾何のみ）
const CARD = {
  padTop: 0.22,
  padBottom: 0.34,
  padSide: 0.18,
  titleH: 0.28,
  titleBodyGap: 0.10,
  bulletIndentIn: 0.30,
  charWMultiplier: 1.1,
  heightSafety: 1.05,
};

// 全テキスト要素のフォントサイズ・太さ・行送り・段落間隔を一元管理する。
// size は pt、lineSpacing は倍率、paraSpaceAfterPt は pt 単位。
const TYPOGRAPHY = {
  // 各スライド上部
  slideTitle:         { size: 23, bold: true },
  slideMessage:       { size: 15, bold: true },
  // フッター
  footer:             { size: 9 },
  // スライドに直貼りする箇条書き（カードに入らない場合）
  slideBullet:        { size: 14, lineSpacing: 1.25, paraSpaceAfterPt: 8 },
  // カード内
  cardTitle:          { size: 13, bold: true },
  cardBody:           { size: 12, lineSpacing: 1.3 },
  cardBullet:         { size: 12, lineSpacing: 1.25, paraSpaceAfterPt: 8 },
  // 表
  tableBody:          { size: 11 },
  // タイトルスライド
  titleSlideEyebrow:  { size: 16, bold: true },
  titleSlideHeading:  { size: 36, bold: true, lineSpacing: 1.2 },
  titleSlideSubtitle: { size: 14 },
  titleSlideMeta:     { size: 10 },
  // セクション区切り
  dividerLabel:       { size: 18, bold: true },
  dividerTitle:       { size: 32, bold: true, lineSpacing: 1.2 },
  // 補足注記（※ 行）
  noteSmall:          { size: 10 },
  noteMedium:         { size: 11 },
  // 未実装プレースホルダ
  todo:               { size: 18 },
};

// 1 文字の表示幅を「全角換算」で返す（全角=1.0, 半角=0.5）。
// 判定は Unicode のブロック単位で、Yu Gothic / 一般的な CJK フォントで
// 半角プロポーショナル描画される範囲を半角と見なす。
function visualCharWidth(text) {
  let v = 0;
  for (const ch of String(text)) {
    const code = ch.charCodeAt(0);
    // ASCII（0x20-0x7E）、Latin-1 補助（× ÷ ° ± § © など）、Latin Extended-A/B、
    // IPA 拡張、修飾文字、結合分音記号、ギリシャ、キリル、ヘブライ、アラビア。
    if (code <= 0x07FF) v += 0.5;
    // 半角カナ／半角ハングル等の Halfwidth Forms
    else if (code >= 0xFF61 && code <= 0xFFDC) v += 0.5;
    // それ以外は全角扱い（CJK 漢字／かな／全角形／全角記号など）
    else v += 1.0;
  }
  return v;
}

function estimateBodyHeight(body, innerW) {
  const style = Array.isArray(body) ? TYPOGRAPHY.cardBullet : TYPOGRAPHY.cardBody;
  const charWIn = (style.size / 72) * CARD.charWMultiplier;
  if (Array.isArray(body)) {
    const usableW = Math.max(0.5, innerW - CARD.bulletIndentIn);
    const charsPerLine = Math.max(1, Math.floor(usableW / charWIn));
    let totalLines = 0;
    for (const text of body) {
      const v = visualCharWidth(text);
      totalLines += Math.max(1, Math.ceil(v / charsPerLine));
    }
    const lineH = (style.size / 72) * style.lineSpacing;
    const paraSpace = (style.paraSpaceAfterPt / 72) * body.length;
    return (totalLines * lineH + paraSpace) * CARD.heightSafety;
  }
  const charsPerLine = Math.max(1, Math.floor(innerW / charWIn));
  const v = visualCharWidth(body);
  const lines = Math.max(1, Math.ceil(v / charsPerLine));
  const lineH = (style.size / 72) * style.lineSpacing;
  return lines * lineH * CARD.heightSafety;
}

function cardHeight(title, body, w) {
  const innerW = w - CARD.padSide * 2;
  const bodyH = estimateBodyHeight(body, innerW);
  return CARD.padTop + CARD.titleH + CARD.titleBodyGap + bodyH + CARD.padBottom;
}

// ---------- 共通コンポーネント ----------
function addTitle(slide, title, message) {
  slide.addText(title, {
    x: SLIDE.marginX,
    y: SLIDE.titleY,
    w: CONTENT_W,
    h: SLIDE.titleH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.slideTitle.size,
    bold: TYPOGRAPHY.slideTitle.bold,
    color: COLORS.text,
    valign: "middle",
  });
  // アクセント線はタイトルの実描画幅に合わせる。
  // CJK 文字は em-square (fontSize/72 in) でほぼ等幅に描画される。
  // 実測でわずかに短くなるため、ACCENT_LINE_W_FACTOR で微補正する。
  const ACCENT_LINE_W_FACTOR = 1.04;
  const accentLineW = Math.min(
    visualCharWidth(title) * (TYPOGRAPHY.slideTitle.size / 72) * ACCENT_LINE_W_FACTOR,
    CONTENT_W
  );
  slide.addShape(ShapeType.rect, {
    x: SLIDE.marginX,
    y: SLIDE.accentLineY,
    w: accentLineW,
    h: SLIDE.accentLineH,
    fill: { color: COLORS.accent },
    line: { type: "none" },
  });
  if (message) {
    slide.addText(message, {
      x: SLIDE.marginX,
      y: SLIDE.messageY,
      w: CONTENT_W,
      h: SLIDE.messageH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.slideMessage.size,
      color: COLORS.accent,
      bold: TYPOGRAPHY.slideMessage.bold,
      valign: "top",
    });
  }
}

function addFooter(slide, pageNumber, totalPages, sectionLabel) {
  if (sectionLabel) {
    slide.addText(sectionLabel, {
      x: SLIDE.marginX,
      y: SLIDE.footerY,
      w: CONTENT_W * 0.7,
      h: SLIDE.footerH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.footer.size,
      color: COLORS.muted,
    });
  }
  slide.addText(`${pageNumber} / ${totalPages}`, {
    x: SLIDE.width - SLIDE.marginX - 1.5,
    y: SLIDE.footerY,
    w: 1.5,
    h: SLIDE.footerH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.footer.size,
    color: COLORS.muted,
    align: "right",
  });
}

// style は TYPOGRAPHY.cardBullet / TYPOGRAPHY.slideBullet 等のスタイル定義オブジェクト。
function addBullets(slide, items, x, y, w, h, style) {
  const arr = items.map((t) => ({
    text: t,
    options: {
      bullet: { code: "25C6" },
      paraSpaceAfter: style.paraSpaceAfterPt,
      indent: 0,
    },
  }));
  slide.addText(arr, {
    x,
    y,
    w,
    h,
    fontFace: FONT.body,
    fontSize: style.size,
    color: COLORS.text,
    valign: "top",
    lineSpacingMultiple: style.lineSpacing,
  });
}

function addCard(slide, x, y, w, h, title, body, opts = {}) {
  const fillColor = opts.fillColor || COLORS.bgSubtle;
  const borderColor = opts.borderColor || COLORS.border;
  const titleColor = opts.titleColor || COLORS.accent;
  slide.addShape(ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: fillColor },
    line: { color: borderColor, width: 0.5 },
    rectRadius: 0.08,
  });
  const innerX = x + CARD.padSide;
  const innerW = w - CARD.padSide * 2;
  slide.addText(title, {
    x: innerX,
    y: y + CARD.padTop,
    w: innerW,
    h: CARD.titleH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.cardTitle.size,
    bold: TYPOGRAPHY.cardTitle.bold,
    color: titleColor,
    valign: "top",
  });
  const bodyY = y + CARD.padTop + CARD.titleH + CARD.titleBodyGap;
  const bodyMaxH = Math.max(0.1, y + h - CARD.padBottom - bodyY);
  if (Array.isArray(body)) {
    addBullets(slide, body, innerX, bodyY, innerW, bodyMaxH, TYPOGRAPHY.cardBullet);
  } else {
    slide.addText(body, {
      x: innerX,
      y: bodyY,
      w: innerW,
      h: bodyMaxH,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.cardBody.size,
      color: COLORS.text,
      valign: "top",
      lineSpacingMultiple: TYPOGRAPHY.cardBody.lineSpacing,
    });
  }
}

// 同一行のカード群を、必要高さの最大値に揃えて配置する。
// cards: [{ x, w, title, body, opts? }]
function addCardRow(slide, y, cards) {
  const heights = cards.map((c) => cardHeight(c.title, c.body, c.w));
  const rowH = Math.max(...heights);
  cards.forEach((c) => {
    addCard(slide, c.x, y, c.w, rowH, c.title, c.body, c.opts || {});
  });
  return rowH;
}

// TWO_COL の左右に2枚のカードを配置する糖衣構文。cards = [left, right]。
function addTwoColRow(slide, y, cards) {
  return addCardRow(
    slide,
    y,
    cards.map((c, i) => ({
      x: i === 0 ? TWO_COL.leftX : TWO_COL.rightX,
      w: TWO_COL.colW,
      ...c,
    }))
  );
}

function addTable(slide, header, rows, x, y, w, opts = {}) {
  const fontSize = opts.fontSize || TYPOGRAPHY.tableBody.size;
  const headerRow = header.map((cell) => ({
    text: cell,
    options: {
      bold: true,
      color: "FFFFFF",
      fill: { color: COLORS.accent },
      align: "center",
      valign: "middle",
      fontFace: FONT.body,
      fontSize,
    },
  }));
  const bodyRows = rows.map((row, idx) =>
    row.map((cell, ci) => ({
      text: cell,
      options: {
        fill: { color: idx % 2 === 0 ? COLORS.bg : COLORS.bgSubtle },
        color: COLORS.text,
        align: ci === 0 ? "left" : "left",
        valign: "middle",
        fontFace: FONT.body,
        fontSize,
      },
    }))
  );
  slide.addTable([headerRow, ...bodyRows], {
    x,
    y,
    w,
    colW: opts.colW,
    rowH: opts.rowH || 0.42,
    border: { type: "solid", pt: 0.5, color: COLORS.border },
  });
}

function buildSectionDivider(slide, label, title) {
  slide.background = { color: COLORS.bgSubtle };
  slide.addText(label, {
    x: SLIDE.marginX,
    y: 2.3,
    w: CONTENT_W,
    h: 0.45,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.dividerLabel.size,
    bold: TYPOGRAPHY.dividerLabel.bold,
    color: COLORS.accent,
    align: "center",
  });
  slide.addText(title, {
    x: SLIDE.marginX,
    y: 3.1,
    w: CONTENT_W,
    h: 1.6,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.dividerTitle.size,
    bold: TYPOGRAPHY.dividerTitle.bold,
    color: COLORS.text,
    align: "center",
    lineSpacingMultiple: TYPOGRAPHY.dividerTitle.lineSpacing,
  });
}

module.exports = {
  COLORS,
  FONT,
  SLIDE,
  CONTENT_W,
  TWO_COL,
  CARD,
  CARD_VARIANTS,
  TYPOGRAPHY,
  ShapeType,
  visualCharWidth,
  estimateBodyHeight,
  cardHeight,
  addTitle,
  addFooter,
  addBullets,
  addCard,
  addCardRow,
  addTwoColRow,
  addTable,
  buildSectionDivider,
};
