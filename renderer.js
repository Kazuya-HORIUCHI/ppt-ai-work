// renderer.js
// セマンティック・スロット方式のスライド生成レンダラ。
// 使い方: node renderer.js <deck.js> <out.pptx>
//
// deck.js は { meta, sections, slides } を CommonJS export する。
// 各 slide は { kind, ... } の宣言データ。kind 一覧と各スキーマは README.md を参照。

const path = require("path");
const pptxgen = require("pptxgenjs");
const {
  COLORS,
  FONT,
  SLIDE,
  CONTENT_W,
  TWO_COL,
  CARD_VARIANTS,
  TYPOGRAPHY,
  ShapeType,
  cardHeight,
  addTitle,
  addFooter,
  addBullets,
  addCard,
  addCardRow,
  addTwoColRow,
  addTable,
  buildSectionDivider,
} = require("./slide-kit");

// ---------------- CLI ----------------
const [, , deckArg, outArg] = process.argv;
if (!deckArg || !outArg) {
  console.error("Usage: node renderer.js <deck.js> <out.pptx>");
  process.exit(1);
}
const deck = require(path.resolve(deckArg));

// ---------------- pptx 初期化 ----------------
const pptx = new pptxgen();
pptx.defineLayout({ name: "CUSTOM_WIDE", width: SLIDE.width, height: SLIDE.height });
pptx.layout = "CUSTOM_WIDE";
pptx.title = deck.meta.title;

const TOTAL = deck.slides.length;

// カード行の固定上余白（cardRowY の既定オフセット）。
// 6 件程度の bullet がちょうど良く見える位置として決め打ち。詳細は cardRowY のコメント参照。
const CARD_TOP_GAP = 0.63;

// spec から footer に表示するセクション文字列を解決する。
// null を返す場合は footer 自体を描画しない（title-slide）。
// "" を返す場合はセクション名なしの footer（section-divider）。
function sectionLabel(spec) {
  if (spec.kind === "title-slide") return null;
  if (spec.kind === "section-divider") return "";
  return deck.sections[spec.section] ?? "要確認";
}

deck.slides.forEach((spec, idx) => {
  const slide = pptx.addSlide();
  dispatch(slide, spec);
  const section = sectionLabel(spec);
  if (section !== null) {
    addFooter(slide, idx + 1, TOTAL, section);
  }
});

pptx.writeFile({ fileName: outArg }).then((file) => {
  console.log(`Generated: ${file}`);
});

// ---------------- Dispatch ----------------
function dispatch(slide, spec) {
  switch (spec.kind) {
    case "title-slide":     return renderTitleSlide(slide, deck.meta);
    case "section-divider": return buildSectionDivider(slide, spec.label, spec.title);
    case "bullets":         return renderBullets(slide, spec);
    case "key-takeaway":    return renderKeyTakeaway(slide, spec);
    case "data-table":      return renderDataTable(slide, spec);
    case "comparison-2":    return renderComparison2(slide, spec);
    case "trio":            return renderTrio(slide, spec);
    case "photo-card":      return renderPhotoCard(slide, spec);
    case "flow-diagram":    return renderFlowDiagram(slide, spec);
    case "process-stages":  return renderProcessStages(slide, spec);
    case "matrix-2x2":      return renderMatrix2x2(slide, spec);
    case "pyramid":         return renderPyramid(slide, spec);
    default:
      slide.addText(`未実装の kind: ${spec.kind}`, {
        x: 1, y: 3, w: 11, h: 1,
        fontFace: FONT.body, fontSize: TYPOGRAPHY.todo.size, color: COLORS.negBorder,
      });
  }
}

// ================ 共通ユーティリティ ================

// variant 名 ("pos" | "neg" | "accent" | "gray" | "neutral" | undefined) を CARD_VARIANTS の opts に解決する。
function variantOpts(variant) {
  if (variant === "pos") return CARD_VARIANTS.pos;
  if (variant === "neg") return CARD_VARIANTS.neg;
  if (variant === "accent") return CARD_VARIANTS.accent;
  if (variant === "gray") return CARD_VARIANTS.gray;
  return {}; // neutral / 未指定はカード既定スタイル（タイトルがアクセント色）
}

// カード行の y 位置を返す。
//
// 配置ルール:
//   1. 既定: 上から固定オフセット (CARD_TOP_GAP) の位置に揃える。
//      6 件程度の bullet がちょうど良く見える位置として決め打ち。
//   2. 行が高くなり下の余白が上の余白より小さくなる場合 (slack < 2 * CARD_TOP_GAP):
//      上下中央揃えに切り替える。固定値からシームレスに連続する。
//   3. 行高がコンテンツ領域を超える場合: contentY を天井としてそこに揃え、超過分は下方向にあふれる。
function cardRowY(cards) {
  const rowH = Math.max(...cards.map((c) => cardHeight(c.title, c.body, c.w)));
  const slack = SLIDE.contentH - rowH;
  if (slack < 2 * CARD_TOP_GAP) {
    return SLIDE.contentY + Math.max(0, slack / 2);
  }
  return SLIDE.contentY + CARD_TOP_GAP;
}

// 図形系 kind 用の汎用ボックス（ラベル + 補足）描画ヘルパー。
function drawLabeledBox(slide, x, y, w, h, label, description, opts = {}) {
  const fillColor = opts.fillColor || COLORS.bgSubtle;
  const borderColor = opts.borderColor || COLORS.accent;
  const labelColor = opts.labelColor || COLORS.accent;
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: borderColor, width: 1.0 },
    rectRadius: 0.08,
  });
  const hasDesc = description && description.length > 0;
  if (hasDesc) {
    slide.addText(label, {
      x: x + 0.12, y: y + 0.10, w: w - 0.24, h: 0.4,
      fontFace: FONT.body, fontSize: 13, bold: true, color: labelColor,
      align: "center", valign: "middle",
    });
    slide.addText(description, {
      x: x + 0.12, y: y + 0.55, w: w - 0.24, h: h - 0.65,
      fontFace: FONT.body, fontSize: 10, color: COLORS.text,
      align: "center", valign: "top", lineSpacingMultiple: 1.25,
    });
  } else {
    slide.addText(label, {
      x: x + 0.12, y, w: w - 0.24, h,
      fontFace: FONT.body, fontSize: 14, bold: true, color: labelColor,
      align: "center", valign: "middle",
    });
  }
}

// ================ 構造系 ================

function renderTitleSlide(slide, meta) {
  slide.background = { color: COLORS.bg };
  slide.addShape(ShapeType.rect, {
    x: 0, y: 0, w: 0.22, h: SLIDE.height,
    fill: { color: COLORS.accent }, line: { type: "none" },
  });
  if (meta.eyebrow) {
    slide.addText(meta.eyebrow, {
      x: 0.9, y: 2.0, w: 11.5, h: 0.6,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideEyebrow.size,
      color: COLORS.accent, bold: TYPOGRAPHY.titleSlideEyebrow.bold,
    });
  }
  slide.addText(meta.heading, {
    x: 0.9, y: 2.7, w: 11.5, h: 2.2,
    fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideHeading.size,
    color: COLORS.text, bold: TYPOGRAPHY.titleSlideHeading.bold,
    lineSpacingMultiple: TYPOGRAPHY.titleSlideHeading.lineSpacing,
  });
  slide.addShape(ShapeType.rect, {
    x: 0.9, y: 5.0, w: 0.6, h: 0.05,
    fill: { color: COLORS.accent }, line: { type: "none" },
  });
  if (meta.subtitle) {
    slide.addText(meta.subtitle, {
      x: 0.9, y: 5.15, w: 11.5, h: 0.5,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideSubtitle.size,
      color: COLORS.subText,
    });
  }
  if (meta.meta) {
    slide.addText(meta.meta, {
      x: 0.9, y: 6.7, w: 11.5, h: 0.3,
      fontFace: FONT.body, fontSize: TYPOGRAPHY.titleSlideMeta.size,
      color: COLORS.muted,
    });
  }
}

// ================ テキスト系 ================

function renderBullets(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  addBullets(
    slide,
    spec.items,
    SLIDE.marginX,
    SLIDE.contentY,
    CONTENT_W,
    SLIDE.contentH,
    TYPOGRAPHY.slideBullet
  );
}

function renderKeyTakeaway(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const hasSupporting = spec.supporting && spec.supporting.length > 0;
  const takeawayH = hasSupporting ? 1.6 : 2.6;
  const takeawayY = SLIDE.contentY + (hasSupporting ? 0.4 : 1.0);
  slide.addText(spec.takeaway, {
    x: SLIDE.marginX, y: takeawayY, w: CONTENT_W, h: takeawayH,
    fontFace: FONT.body, fontSize: 28, bold: true,
    color: COLORS.accent, align: "center", valign: "middle",
    lineSpacingMultiple: 1.3,
  });
  if (hasSupporting) {
    addBullets(
      slide,
      spec.supporting,
      SLIDE.marginX + 1.0,
      takeawayY + takeawayH + 0.3,
      CONTENT_W - 2.0,
      2.0,
      TYPOGRAPHY.slideBullet
    );
  }
}

function renderDataTable(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  addTable(
    slide,
    spec.header,
    spec.rows,
    SLIDE.marginX,
    SLIDE.contentY,
    CONTENT_W,
    { colW: spec.colW, rowH: spec.rowH, fontSize: spec.fontSize }
  );
  if (spec.note) {
    const noteStyle =
      spec.note.style === "small" ? TYPOGRAPHY.noteSmall : TYPOGRAPHY.noteMedium;
    const noteGap = spec.note.gap ?? 0.25;
    const totalRows = spec.rows.length + 1; // header 行を含む
    slide.addText(spec.note.text, {
      x: SLIDE.marginX,
      y: SLIDE.contentY + spec.rowH * totalRows + noteGap,
      w: CONTENT_W, h: 0.4,
      fontFace: FONT.body, fontSize: noteStyle.size, color: COLORS.muted,
    });
  }
}

// ================ 比較系 ================

function renderComparison2(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // x/w は addTwoColRow が注入するが、行高の事前計算には w が必要なので
  // 同じ値を centeredCardRowY 用の card 仮オブジェクトにも持たせる。
  const cards = [
    {
      title: spec.left.title,
      body: spec.left.body,
      w: TWO_COL.colW,
      opts: variantOpts(spec.left.variant),
    },
    {
      title: spec.right.title,
      body: spec.right.body,
      w: TWO_COL.colW,
      opts: variantOpts(spec.right.variant),
    },
  ];
  addTwoColRow(slide, cardRowY(cards), cards);
}

function renderTrio(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const cardGapX = 0.14;
  const cardW = (CONTENT_W - cardGapX * 2) / 3;
  // trio の各カードは既定で "gray"（並列観点をフラットに見せる）。
  // 強調したい場合は最右カードに variant: "accent" / "pos" / "neg" を指定する運用とする。
  const cards = spec.cards.map((c, i) => ({
    x: SLIDE.marginX + (cardW + cardGapX) * i,
    w: cardW,
    title: c.title,
    body: c.body,
    opts: variantOpts(c.variant ?? "gray"),
  }));
  addCardRow(slide, cardRowY(cards), cards);
}

// ================ 写真系 ================

// 右に写真、左にカード（箇条書き）の事例紹介レイアウト。
// 幅比は写真:カード = 6:4。間に gap を挟む。写真は 4:3 をベースに
// sizing: contain で枠内に収める（エリア比 (≈1.45) が 4:3 (≈1.33) より
// 横長のため、左右に薄く余白が出る）。
function renderPhotoCard(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // AREA_SCALE: タイトル + メッセージとの間延びを抑えるため、コンテンツ領域に
  // 対する縮小率。カード/写真の幅と高さは AREA_SCALE で縮める。gap だけは
  // 別パラメータで、カード/写真幅とは独立に調整できる（広げるとエリア全体は
  // 横方向に伸びる）。エリアはコンテンツ領域内で水平・垂直とも中央配置する。
  const AREA_SCALE = 0.92;
  const baseGap = 0.35 * AREA_SCALE;
  const usableW = CONTENT_W * AREA_SCALE - baseGap;
  const cardW = usableW * 0.4;
  const photoW = usableW * 0.6;
  const gap = baseGap * 1.5;  // カード/写真幅は据え置き、間だけ広げる
  const h = SLIDE.contentH * AREA_SCALE;
  const fullW = cardW + gap + photoW;
  const cardX = SLIDE.marginX + (CONTENT_W - fullW) / 2;
  const photoX = cardX + cardW + gap;
  const y = SLIDE.contentY + (SLIDE.contentH - h) / 2;

  addCard(
    slide,
    cardX, y, cardW, h,
    spec.card.title,
    spec.card.body,
    variantOpts(spec.card.variant)
  );

  const deckDir = path.dirname(path.resolve(deckArg));
  const imgPath = path.resolve(deckDir, spec.image.src);
  slide.addImage({
    path: imgPath,
    x: photoX, y, w: photoW, h,
    sizing: { type: "contain", w: photoW, h },
  });
}

// ================ 図形系 ================

function renderFlowDiagram(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.steps.length;
  const arrowW = 0.5;
  const arrowH = 0.4;
  const totalArrow = arrowW * (n - 1);
  const boxW = (CONTENT_W - totalArrow) / n;
  const boxH = 2.0;
  const y = SLIDE.contentY + 1.2;
  for (let i = 0; i < n; i++) {
    const x = SLIDE.marginX + i * (boxW + arrowW);
    drawLabeledBox(slide, x, y, boxW, boxH, spec.steps[i].label, spec.steps[i].description);
    if (i < n - 1) {
      slide.addShape(ShapeType.rightArrow, {
        x: x + boxW, y: y + (boxH - arrowH) / 2, w: arrowW, h: arrowH,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
  }
}

function renderProcessStages(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.stages.length;
  const gap = 0.3;
  const itemW = (CONTENT_W - gap * (n - 1)) / n;
  const badgeD = 0.8; // diameter
  const y0 = SLIDE.contentY + 0.6;
  for (let i = 0; i < n; i++) {
    const cx = SLIDE.marginX + i * (itemW + gap) + itemW / 2;
    // 番号バッジ
    slide.addShape(ShapeType.ellipse, {
      x: cx - badgeD / 2, y: y0, w: badgeD, h: badgeD,
      fill: { color: COLORS.accent }, line: { type: "none" },
    });
    slide.addText(String(i + 1), {
      x: cx - badgeD / 2, y: y0, w: badgeD, h: badgeD,
      fontFace: FONT.body, fontSize: 22, bold: true,
      color: "FFFFFF", align: "center", valign: "middle",
    });
    // ラベル
    slide.addText(spec.stages[i].label, {
      x: cx - itemW / 2, y: y0 + badgeD + 0.15, w: itemW, h: 0.5,
      fontFace: FONT.body, fontSize: 14, bold: true,
      color: COLORS.text, align: "center", valign: "top",
    });
    // 説明
    if (spec.stages[i].description) {
      slide.addText(spec.stages[i].description, {
        x: cx - itemW / 2, y: y0 + badgeD + 0.7, w: itemW, h: 2.5,
        fontFace: FONT.body, fontSize: 11, color: COLORS.subText,
        align: "center", valign: "top", lineSpacingMultiple: 1.3,
      });
    }
  }
}

function renderMatrix2x2(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // 軸ラベル領域
  const yLabelW = 0.8;  // 左側の Y 軸ラベル幅
  const xLabelH = 0.4;  // 下側の X 軸ラベル高さ
  const matX = SLIDE.marginX + yLabelW;
  const matY = SLIDE.contentY;
  const matW = CONTENT_W - yLabelW;
  const matH = SLIDE.contentH - xLabelH;
  const cellW = matW / 2;
  const cellH = matH / 2;

  // 4 セル: topLeft, topRight, bottomLeft, bottomRight の順
  const cells = [
    { x: matX,         y: matY,         q: spec.quadrants.topLeft },
    { x: matX + cellW, y: matY,         q: spec.quadrants.topRight },
    { x: matX,         y: matY + cellH, q: spec.quadrants.bottomLeft },
    { x: matX + cellW, y: matY + cellH, q: spec.quadrants.bottomRight },
  ];
  for (const { x, y, q } of cells) {
    slide.addShape(ShapeType.rect, {
      x, y, w: cellW, h: cellH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(q.title, {
      x: x + 0.15, y: y + 0.12, w: cellW - 0.3, h: 0.4,
      fontFace: FONT.body, fontSize: 13, bold: true,
      color: COLORS.accent, valign: "top",
    });
    if (q.body) {
      slide.addText(q.body, {
        x: x + 0.15, y: y + 0.55, w: cellW - 0.3, h: cellH - 0.7,
        fontFace: FONT.body, fontSize: 11, color: COLORS.text,
        valign: "top", lineSpacingMultiple: 1.3,
      });
    }
  }
  // X 軸ラベル（下側、low が左 / high が右）
  slide.addText(spec.xAxis.low, {
    x: matX, y: matY + matH, w: cellW, h: xLabelH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  slide.addText(spec.xAxis.high, {
    x: matX + cellW, y: matY + matH, w: cellW, h: xLabelH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  // Y 軸ラベル（左側、high が上 / low が下）
  slide.addText(spec.yAxis.high, {
    x: SLIDE.marginX, y: matY, w: yLabelW, h: cellH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
  slide.addText(spec.yAxis.low, {
    x: SLIDE.marginX, y: matY + cellH, w: yLabelW, h: cellH,
    fontFace: FONT.body, fontSize: 12, bold: true,
    color: COLORS.subText, align: "center", valign: "middle",
  });
}

function renderPyramid(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  // layout:
  //   "centered" (既定): ピラミッドを中央配置し、各層内に label + description を縦並びで配置
  //   "side":            ピラミッドを左寄せし、説明文を右側に並べる
  const layout = spec.layout ?? "centered";
  if (layout === "side") {
    renderPyramidSide(slide, spec);
  } else {
    renderPyramidCentered(slide, spec);
  }
}

function renderPyramidCentered(slide, spec) {
  const n = spec.tiers.length;
  const tierH = 1.0;
  const gap = 0.1;
  const totalH = tierH * n + gap * (n - 1);
  const startY = SLIDE.contentY + (SLIDE.contentH - totalH) / 2;
  // 中心揃え、各層の幅は線形補間。tiers[0] が頂点 (最小幅)、最後が底辺 (最大幅)。
  const maxW = CONTENT_W * 0.7;
  const minW = maxW * 0.32;
  const cx = SLIDE.marginX + CONTENT_W / 2;
  for (let i = 0; i < n; i++) {
    const ratio = n === 1 ? 1 : i / (n - 1);
    const w = minW + (maxW - minW) * ratio;
    const x = cx - w / 2;
    const y = startY + i * (tierH + gap);
    slide.addShape(ShapeType.rect, {
      x, y, w, h: tierH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.accent, width: 1.0 },
    });
    slide.addText(spec.tiers[i].label, {
      x: x + 0.1, y: y + 0.08, w: w - 0.2, h: 0.4,
      fontFace: FONT.body, fontSize: 14, bold: true,
      color: COLORS.accent, align: "center", valign: "middle",
    });
    if (spec.tiers[i].description) {
      slide.addText(spec.tiers[i].description, {
        x: x + 0.15, y: y + 0.5, w: w - 0.3, h: tierH - 0.6,
        fontFace: FONT.body, fontSize: 10, color: COLORS.text,
        align: "center", valign: "top", lineSpacingMultiple: 1.25,
      });
    }
  }
}

function renderPyramidSide(slide, spec) {
  const n = spec.tiers.length;
  const tierH = 0.7;
  const gap = 0.1;
  const totalH = tierH * n + gap * (n - 1);
  const startY = SLIDE.contentY + (SLIDE.contentH - totalH) / 2;
  const maxW = CONTENT_W * 0.55;
  const minW = maxW * 0.32;
  const cxLeft = SLIDE.marginX + CONTENT_W * 0.30;
  for (let i = 0; i < n; i++) {
    const ratio = n === 1 ? 1 : i / (n - 1);
    const w = minW + (maxW - minW) * ratio;
    const x = cxLeft - w / 2;
    const y = startY + i * (tierH + gap);
    slide.addShape(ShapeType.rect, {
      x, y, w, h: tierH,
      fill: { color: COLORS.bgSubtle },
      line: { color: COLORS.accent, width: 1.0 },
    });
    slide.addText(spec.tiers[i].label, {
      x, y, w, h: tierH,
      fontFace: FONT.body, fontSize: 13, bold: true,
      color: COLORS.accent, align: "center", valign: "middle",
    });
    if (spec.tiers[i].description) {
      const descX = cxLeft + maxW / 2 + 0.3;
      const descW = SLIDE.marginX + CONTENT_W - descX;
      slide.addText(spec.tiers[i].description, {
        x: descX, y, w: descW, h: tierH,
        fontFace: FONT.body, fontSize: 11, color: COLORS.subText,
        valign: "middle", lineSpacingMultiple: 1.3,
      });
    }
  }
}
