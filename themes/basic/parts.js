// themes/basic/parts.js
// basic テーマの低レベル描画パーツ。
// 「このテーマの見た目」を持つ描画ヘルパーと、パーツ寸法の計算関数を提供する。
// deck.js の spec 構造は知らない（素の引数のみで動く）。spec の解釈は kinds/ 側の責務。

const {
  COLORS,
  FONT,
  SLIDE,
  CONTENT_W,
  TWO_COL,
  CARD,
  PANEL_CARD,
  PANEL_CARD_VARIANTS,
  PANEL_BULLETS,
  TYPOGRAPHY,
} = require("./tokens");
const tokens = require("./tokens");
const { visualCharWidth, estimateBodyHeight: coreEstimateBodyHeight } = require("../../core/text-metrics");
const { ShapeType } = require("../../core/engine");

// core/text-metrics の推定式に basic テーマの tokens を束縛したもの。
function estimateBodyHeight(body, innerW) {
  return coreEstimateBodyHeight(body, innerW, tokens);
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

// engine が未登録 kind に遭遇したときのフォールバック描画。
function addUnimplementedPlaceholder(slide, kindName) {
  slide.addText(`未実装の kind: ${kindName}`, {
    x: 1, y: 3, w: 11, h: 1,
    fontFace: FONT.body, fontSize: TYPOGRAPHY.todo.size, color: COLORS.negBorder,
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

// ---------- 見出し帯付きパネルカード（タイトル帯 + 区切り線つきリスト） ----------
//
// 「Pricing Tiers」「pros/cons」「観点別ラベル」のような外観のカード。
// - タイトル帯はカード単位で variant 切替可（accent / pos / neg）
// - body は短文の items 配列のみ受け付ける（箇条書きマーカーは描画しない）
// - items は 1 行で表示することを前提とする（折り返しは考慮しない）
// - 各 item はカード幅で水平中央揃え
// - item 間および空スロット間に薄いセパレータ線を入れる

// items を 1 行ずつ並べる前提で、カード全体の高さを返す。
function panelCardHeight(items) {
  return PANEL_CARD.titleBarH + items.length * PANEL_CARD.itemRowH;
}

function addPanelCard(slide, x, y, w, h, title, items, opts = {}) {
  const variant = PANEL_CARD_VARIANTS[opts.variant] || PANEL_CARD_VARIANTS.accent;
  // タイトル帯（variant 色背景・白文字）
  slide.addShape(ShapeType.rect, {
    x, y, w, h: PANEL_CARD.titleBarH,
    fill: { color: variant.titleBarColor },
    line: { type: "none" },
  });
  slide.addText(title, {
    x, y, w, h: PANEL_CARD.titleBarH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.cardTitle.size,
    bold: TYPOGRAPHY.cardTitle.bold,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // ボディ領域（白背景 + variant 枠線）
  const bodyY = y + PANEL_CARD.titleBarH;
  const bodyH = h - PANEL_CARD.titleBarH;
  slide.addShape(ShapeType.rect, {
    x, y: bodyY, w, h: bodyH,
    fill: { color: COLORS.bg },
    line: { color: variant.bodyBorderColor, width: 0.5 },
  });

  // items は内側幅で水平中央揃え。
  // pptxgenjs の既定 inset（左右計 ≈ 0.2 in）が実描画幅を削るため、
  // margin: 0 で inset を打ち消し、innerW いっぱいをテキスト描画に使う。
  const innerX = x + PANEL_CARD.itemPadSide;
  const innerW = w - PANEL_CARD.itemPadSide * 2;

  items.forEach((item, i) => {
    const itemY = bodyY + i * PANEL_CARD.itemRowH;
    slide.addText(item, {
      x: innerX,
      y: itemY,
      w: innerW,
      h: PANEL_CARD.itemRowH,
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
  const slots = Math.round(bodyH / PANEL_CARD.itemRowH);
  for (let i = 1; i < slots; i++) {
    const sepY = bodyY + i * PANEL_CARD.itemRowH;
    slide.addShape(ShapeType.rect, {
      x: x + PANEL_CARD.itemPadSide,
      y: sepY - PANEL_CARD.separatorH / 2,
      w: w - PANEL_CARD.itemPadSide * 2,
      h: PANEL_CARD.separatorH,
      fill: { color: COLORS.border },
      line: { type: "none" },
    });
  }
}

// 同一行のパネルカード群を、最大 item 数に合わせて同じ高さで描画する。
// cards: [{ x, w, title, items, variant? }]
function addPanelCardRow(slide, y, cards) {
  const maxItems = Math.max(...cards.map((c) => c.items.length));
  const rowH = PANEL_CARD.titleBarH + maxItems * PANEL_CARD.itemRowH;
  cards.forEach((c) => {
    addPanelCard(slide, c.x, y, c.w, rowH, c.title, c.items, { variant: c.variant });
  });
  return rowH;
}

// ---------- 見出し帯付きパネルカード（箇条書きバージョン） ----------
//
// panel-cards のレイアウト・寸法・variant 体系をそのまま流用し、items の表示だけを
// 「菱形マーカー付きの左寄せ箇条書き」（comparison-2 等と同じ表現）に差し替えたバージョン。
// 1 item = 1 行（panel-cards と同じ itemRowH ぶんの行高）を前提とし、各行はカードの
// 内側左端から描画する。区切り線・タイトル帯・本文枠線・全スロット分のセパレータは
// panel-cards と同じ仕様で出る。
//
// フォントサイズは TYPOGRAPHY.cardBody (12pt) の約 1.1 倍として 13pt を使う
// （PANEL_BULLETS.itemFontSize）。文字数上限は panel-cards と同じ運用とし、超過時の
// レイアウト破綻リスクも panel-cards と同等とする。

// items を 1 行ずつ並べる panel-bullets 用のカード高。
// panel-cards との差分は bodyPadY * 2（上下パディング）だけ。
function panelBulletsCardHeight(items) {
  return (
    PANEL_CARD.titleBarH +
    PANEL_BULLETS.bodyPadY * 2 +
    items.length * PANEL_CARD.itemRowH
  );
}

function addPanelBulletsCard(slide, x, y, w, h, title, items, opts = {}) {
  const variant = PANEL_CARD_VARIANTS[opts.variant] || PANEL_CARD_VARIANTS.accent;
  // タイトル帯（panel-cards と同じ）
  slide.addShape(ShapeType.rect, {
    x, y, w, h: PANEL_CARD.titleBarH,
    fill: { color: variant.titleBarColor },
    line: { type: "none" },
  });
  slide.addText(title, {
    x, y, w, h: PANEL_CARD.titleBarH,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.cardTitle.size,
    bold: TYPOGRAPHY.cardTitle.bold,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // ボディ領域（panel-cards と同じ枠線・背景）
  const bodyY = y + PANEL_CARD.titleBarH;
  const bodyH = h - PANEL_CARD.titleBarH;
  slide.addShape(ShapeType.rect, {
    x, y: bodyY, w, h: bodyH,
    fill: { color: COLORS.bg },
    line: { color: variant.bodyBorderColor, width: 0.5 },
  });

  // 行頭位置の計算:
  //   そのカード内で最長の item の「bullet + テキスト」の視覚幅を見積もり、その
  //   ブロックがカード幅で左右中央に来る位置を、全 item 共通の x として使う。
  //   これにより全 item の bullet 列が垂直に揃い、最長の行が見た目上カード中央に
  //   くる。短い item は同じ x から始まり、右側に余白ができる。
  //
  //   bullet + 字間スペースは常に「全角 2 字相当」で見積もる（bulletGapCharUnits）。
  //   実描画の bullet 幅 + tab 幅がフォント・レンダラによって揺れるため、余裕を持って
  //   2 字換算にすることで、短い item でも視覚的な中央寄せがずれにくくなる。
  const charWidthIn = (PANEL_BULLETS.itemFontSize / 72) * CARD.charWMultiplier;
  const bulletGapIn = charWidthIn * PANEL_BULLETS.bulletGapCharUnits;
  const maxChars = Math.max(...items.map((it) => visualCharWidth(it)));
  const longestVisualW = bulletGapIn + maxChars * charWidthIn;
  const innerLeft = x + PANEL_CARD.itemPadSide;
  const innerRight = x + w - PANEL_CARD.itemPadSide;
  // 中央寄せ位置がカード内側左端より外側になる場合は左端でクランプ（最長 item が
  // カード幅を埋めるケース）。テキスト幅も右内側端まで使えるように広げる。
  const centerX = x + (w - longestVisualW) / 2;
  const textX = Math.max(innerLeft, centerX);
  const textW = Math.max(longestVisualW, innerRight - textX);

  // 上下端の item がカード上下端と近接して見えるのを避けるため、行間と同じ量
  // （PANEL_BULLETS.bodyPadY = itemRowH / 2）だけ ボディ内側から下げて配置する。
  const itemsTop = bodyY + PANEL_BULLETS.bodyPadY;
  items.forEach((item, i) => {
    const itemY = itemsTop + i * PANEL_CARD.itemRowH;
    slide.addText(
      [{ text: item, options: { bullet: { code: "25C6" }, indent: 0 } }],
      {
        x: textX,
        y: itemY,
        w: textW,
        h: PANEL_CARD.itemRowH,
        margin: 0,
        fontFace: FONT.body,
        fontSize: PANEL_BULLETS.itemFontSize,
        color: COLORS.text,
        valign: "middle",
      }
    );
  });
}

// 同一行のパネルカード（箇条書き版）群を、最大 item 数に合わせて同じ高さで描画する。
// cards: [{ x, w, title, items, variant? }]
function addPanelBulletsCardRow(slide, y, cards) {
  const maxItems = Math.max(...cards.map((c) => c.items.length));
  const rowH = panelBulletsCardHeight(new Array(maxItems));
  cards.forEach((c) => {
    addPanelBulletsCard(slide, c.x, y, c.w, rowH, c.title, c.items, { variant: c.variant });
  });
  return rowH;
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
  estimateBodyHeight,
  cardHeight,
  panelCardHeight,
  panelBulletsCardHeight,
  addTitle,
  addFooter,
  addUnimplementedPlaceholder,
  addBullets,
  addCard,
  addCardRow,
  addTwoColRow,
  addPanelCard,
  addPanelCardRow,
  addPanelBulletsCard,
  addPanelBulletsCardRow,
  addTable,
  buildSectionDivider,
};
