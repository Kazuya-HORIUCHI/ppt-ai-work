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
//
// charWMultiplier:
//   1 文字あたりの推定幅 = (fontSize / 72) * charWMultiplier (inches)。
//   実描画（Yu Gothic, 12pt）で 1 行に収まる字数の実測上限と、
//   Math.floor(usableW / charWIn) の結果が一致する最大値を逆算する:
//     comparison-2 (usableW = 5.2065 in, 実測上限 29 字) → multiplier ≤ 5.2065 / 29 / (12/72) ≈ 1.0772
//     trio        (usableW = 3.258 in,  実測上限 17 字) → multiplier ≤ 3.258  / 17 / (12/72) ≈ 1.1499
//   comparison-2 側がより厳しい上限を課すため、その制約を満たす値として 1.07 を採用。
//   trio 側は実測 17 字に対して formula は 18 字/行と算出する（やや楽観的）が、
//   17 字ルールを README/SKILL で守らせている限りカード高の不足は発生しない。
//   1.07 未満まで下げると、長い本文が想定外に 1 行扱いされ、カード高が不足するリスクが増える。
const CARD = {
  padTop: 0.22,
  padBottom: 0.34,
  padSide: 0.18,
  titleH: 0.28,
  titleBodyGap: 0.10,
  bulletIndentIn: 0.30,
  charWMultiplier: 1.07,
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

// ---------- キャプチャ風カード（タイトル帯 + 区切り線つきリスト） ----------
//
// 「Pricing Tiers」のような外観のカード。
// - タイトルはアクセント色（青）背景の白文字で帯状に表示
// - body は短文の items 配列のみ受け付ける（箇条書きマーカーは描画しない）
// - items は 1 行で表示することを前提とする（折り返しは考慮しない）
// - 各 item はカード幅で水平中央揃え
// - item 間および空スロット間に薄いセパレータ線を入れる
const CAPTURE_CARD = {
  titleBarH: 0.55,
  itemRowH: 0.55,
  itemPadSide: 0.20,
  separatorH: 0.008,
};

// items を 1 行ずつ並べる前提で、カード全体の高さを返す。
function captureCardHeight(items) {
  return CAPTURE_CARD.titleBarH + items.length * CAPTURE_CARD.itemRowH;
}

function addCaptureCard(slide, x, y, w, h, title, items) {
  // タイトル帯（アクセント色背景・白文字）
  slide.addShape(ShapeType.rect, {
    x, y, w, h: CAPTURE_CARD.titleBarH,
    fill: { color: COLORS.accent },
    line: { type: "none" },
  });
  slide.addText(title, {
    x, y, w, h: CAPTURE_CARD.titleBarH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.cardTitle.size,
    bold: TYPOGRAPHY.cardTitle.bold,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // ボディ領域（白背景 + 薄い枠線）
  const bodyY = y + CAPTURE_CARD.titleBarH;
  const bodyH = h - CAPTURE_CARD.titleBarH;
  slide.addShape(ShapeType.rect, {
    x, y: bodyY, w, h: bodyH,
    fill: { color: COLORS.bg },
    line: { color: COLORS.border, width: 0.5 },
  });

  // items は内側幅で水平中央揃え。
  // pptxgenjs の既定 inset（左右計 ≈ 0.2 in）が実描画幅を削るため、
  // margin: 0 で inset を打ち消し、innerW いっぱいをテキスト描画に使う。
  const innerX = x + CAPTURE_CARD.itemPadSide;
  const innerW = w - CAPTURE_CARD.itemPadSide * 2;

  items.forEach((item, i) => {
    const itemY = bodyY + i * CAPTURE_CARD.itemRowH;
    slide.addText(item, {
      x: innerX,
      y: itemY,
      w: innerW,
      h: CAPTURE_CARD.itemRowH,
      margin: 0,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.cardBody.size,
      color: COLORS.text,
      align: "center",
      valign: "middle",
    });
  });

  // 区切り線は items 件数ではなく、行高から逆算したスロット数ぶん引く。
  // 行の少ないカードと多いカードを横並びにすると、items 件数で打ち切ると
  // 下部が間延びして見えるため、全スロット分まで線を引いて高さを揃える。
  const slots = Math.round(bodyH / CAPTURE_CARD.itemRowH);
  for (let i = 1; i < slots; i++) {
    const sepY = bodyY + i * CAPTURE_CARD.itemRowH;
    slide.addShape(ShapeType.rect, {
      x: x + CAPTURE_CARD.itemPadSide,
      y: sepY - CAPTURE_CARD.separatorH / 2,
      w: w - CAPTURE_CARD.itemPadSide * 2,
      h: CAPTURE_CARD.separatorH,
      fill: { color: COLORS.border },
      line: { type: "none" },
    });
  }
}

// 同一行のキャプチャ風カード群を、最大 item 数に合わせて同じ高さで描画する。
// cards: [{ x, w, title, items }]
function addCaptureCardRow(slide, y, cards) {
  const maxItems = Math.max(...cards.map((c) => c.items.length));
  const rowH = CAPTURE_CARD.titleBarH + maxItems * CAPTURE_CARD.itemRowH;
  cards.forEach((c) => {
    addCaptureCard(slide, c.x, y, c.w, rowH, c.title, c.items);
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
  CAPTURE_CARD,
  TYPOGRAPHY,
  ShapeType,
  visualCharWidth,
  estimateBodyHeight,
  cardHeight,
  captureCardHeight,
  addTitle,
  addFooter,
  addBullets,
  addCard,
  addCardRow,
  addTwoColRow,
  addCaptureCard,
  addCaptureCardRow,
  addTable,
  buildSectionDivider,
};
