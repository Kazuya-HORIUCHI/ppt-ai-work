const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

pptx.title = "譜読み・ソルフェージュ特化型オンライン事業 競合分析および差別化戦略";

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
  slide.addShape(pptx.ShapeType.rect, {
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
  slide.addShape(pptx.ShapeType.roundRect, {
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

// ---------- スライド種別 ----------
function buildTitleSlide(slide) {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.22,
    h: SLIDE.height,
    fill: { color: COLORS.accent },
    line: { type: "none" },
  });
  slide.addText("競合分析および差別化戦略 報告書", {
    x: 0.9,
    y: 2.0,
    w: 11.5,
    h: 0.6,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.titleSlideEyebrow.size,
    color: COLORS.accent,
    bold: TYPOGRAPHY.titleSlideEyebrow.bold,
  });
  slide.addText("譜読み・ソルフェージュ特化型\nオンライン事業の市場参入", {
    x: 0.9,
    y: 2.7,
    w: 11.5,
    h: 2.2,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.titleSlideHeading.size,
    color: COLORS.text,
    bold: TYPOGRAPHY.titleSlideHeading.bold,
    lineSpacingMultiple: TYPOGRAPHY.titleSlideHeading.lineSpacing,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 5.0,
    w: 0.6,
    h: 0.05,
    fill: { color: COLORS.accent },
    line: { type: "none" },
  });
  slide.addText(
    "市場全体トレンド／競合 3 カテゴリ分析／差別化戦略 4 本柱",
    {
      x: 0.9,
      y: 5.15,
      w: 11.5,
      h: 0.5,
      fontFace: FONT.body,
      fontSize: TYPOGRAPHY.titleSlideSubtitle.size,
      color: COLORS.subText,
    }
  );
  slide.addText("作成日: 仮置き", {
    x: 0.9,
    y: 6.7,
    w: 11.5,
    h: 0.3,
    fontFace: FONT.body,
    fontSize: TYPOGRAPHY.titleSlideMeta.size,
    color: COLORS.muted,
  });
}

function buildSectionDivider(slide, label, title, pageNumber, totalPages) {
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
  addFooter(slide, pageNumber, totalPages, "");
}

// ---------- スライド生成 ----------
const sectionLabels = {
  intro: "イントロダクション",
  yamaha: "競合分析｜大手音楽教室",
  trainer: "競合分析｜講師育成ビジネス",
  online: "競合分析｜個人オンラインレッスン",
  matrix: "競合分析｜比較マトリクス",
  conclusion: "結論｜差別化戦略",
};

const slidesPlan = [
  { kind: "title" },
  { kind: "intro" },
  { kind: "divider", label: "Section 1", title: "大手音楽教室（ヤマハ・カワイ）の現状分析" },
  { kind: "yamaha-target" },
  { kind: "yamaha-service" },
  { kind: "yamaha-price" },
  { kind: "yamaha-marketing" },
  { kind: "yamaha-approach" },
  { kind: "yamaha-review" },
  { kind: "divider", label: "Section 2", title: "ピアノ講師育成ビジネスの現状分析" },
  { kind: "trainer-target" },
  { kind: "trainer-service" },
  { kind: "trainer-price" },
  { kind: "trainer-marketing" },
  { kind: "trainer-approach" },
  { kind: "trainer-review" },
  { kind: "divider", label: "Section 3", title: "個人オンラインレッスン・オンラインコンサルの現状分析" },
  { kind: "online-target" },
  { kind: "online-service" },
  { kind: "online-price" },
  { kind: "online-marketing" },
  { kind: "online-approach" },
  { kind: "online-review" },
  { kind: "matrix" },
  { kind: "divider", label: "Section 4", title: "結論：競合とバッティングしない差別化の方向性" },
  { kind: "conclusion-1" },
  { kind: "conclusion-2" },
  { kind: "conclusion-3" },
  { kind: "conclusion-4" },
];

const TOTAL = slidesPlan.length;

function pageOf(idx) {
  return idx + 1;
}

// 標準的な2カード左右レイアウトの寸法（contentY 起点、各カードの高さは内容に応じて算出）
const TWO_COL = {
  leftX: SLIDE.marginX,
  rightX: SLIDE.marginX + (CONTENT_W - 0.30) / 2 + 0.30,
  colW: (CONTENT_W - 0.30) / 2,
  y: SLIDE.contentY,
};

slidesPlan.forEach((spec, idx) => {
  const slide = pptx.addSlide();
  const page = pageOf(idx);

  switch (spec.kind) {
    case "title":
      buildTitleSlide(slide);
      break;

    case "intro": {
      addTitle(
        slide,
        "はじめに：市場の全体トレンドと新規事業の参入余地",
        "譜読み・ソルフェージュは既存教育で未解決の構造課題であり、オンライン特化の参入余地が大きい"
      );
      const row1Y = SLIDE.contentY;
      const gap = 0.15;
      const cardGapX = 0.14;
      const cardW = (CONTENT_W - cardGapX * 2) / 3;
      const row1H = addCardRow(slide, row1Y, [
        {
          x: SLIDE.marginX,
          w: cardW,
          title: "トレンド 1：聴覚先行型の限界",
          body: [
            "大手の「聴く→歌う→弾く」優先で読譜は後回し",
            "ジュニア期に「楽譜が読めず自力で新曲練習が進まない」壁",
            "結果として「譜読み難民」が大量発生",
          ],
        },
        {
          x: SLIDE.marginX + cardW + cardGapX,
          w: cardW,
          title: "トレンド 2：講師の教材コスト負担",
          body: [
            "ソルフェージュ指導が属人化し定型メソッドが乏しい",
            "認定資格と紙のフラッシュカードに依存",
            "初期投資・保管・持ち運びの負担が大きい",
          ],
        },
        {
          x: SLIDE.marginX + (cardW + cardGapX) * 2,
          w: cardW,
          title: "トレンド 3：オンラインの技術的限界",
          body: [
            "回線タイムラグで連弾・リズム合わせが不成立",
            "音声圧縮で微細なタッチや音色が伝わらない",
            "リアルタイム演奏指導には構造的な制約",
          ],
        },
      ]);
      const row2Y = row1Y + row1H + gap;
      addCardRow(slide, row2Y, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "参入余地（ポジショニングの機会）",
          body: [
            "譜読み・ソルフェージュは「視覚情報を論理処理する認知トレーニング」",
            "音の遅延・音色変化の影響を受けない領域 → オンラインの弱点が無効化される",
            "画面共有・動画・アプリで「知的認識・認知操作」を体系化すれば競合と物理的に衝突しない",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.intro);
      break;
    }

    case "divider":
      buildSectionDivider(slide, spec.label, spec.title, page, TOTAL);
      break;

    // ===== 大手音楽教室 =====
    case "yamaha-target":
      addTitle(
        slide,
        "ターゲット層：幼児〜ジュニア層とその保護者",
        "メインは 4〜5 歳の幼児期から小学校低学年。児童期に読譜の壁に直面する"
      );
      addBullets(
        slide,
        [
          "メインターゲット：4〜5 歳の幼児期〜小学校低学年のジュニア層、およびその保護者",
          "幼児期は「楽しく歌って弾く」で満足できる",
          "児童期に「曲が難しくなり、模倣や耳コピだけでは弾けなくなる」課題に直面",
          "家で子どもが一人で譜読みできず、練習のたびに親子で多大なストレスを抱える",
          "保護者は「子供の自立的な読譜力の欠如」に強い危機感を抱き始める",
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        SLIDE.contentH,
        TYPOGRAPHY.slideBullet
      );
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;

    case "yamaha-service": {
      addTitle(
        slide,
        "サービス内容・提供形態：自社教本×実店舗の体系的カリキュラム",
        "ヤマハは「きく→うたう→ひく→よむ→つくる」の体系、カワイは個人レッスン型ソルフェージュ入門"
      );
      const gap = 0.15;
      const row1H = addCardRow(slide, SLIDE.contentY, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "ヤマハ",
          body: [
            "「きく→うたう→ひく→よむ→つくる」の体系プロセス",
            "幼児期は聴音・歌唱中心、ソルフェージュ力を育成",
            "ジュニア専門コース等で 2 年間に 5 つの調を経験",
            "左手の和音伴奏と右手のメロディーを弾き分け",
            "実店舗でのグループレッスンが基本",
            "ダウンウェイト 約 50g：軽快なタッチ",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "カワイ",
          body: [
            "「3 歳ソルフェージュ」など個人レッスン形式の入門コース",
            "音感とリズムの土台を築くピアノ入門準備",
            "自社開発の体系的なオリジナル教本を使用",
            "個人指導を基本形式",
            "中音部ダウンウェイト 54g：重厚な「カワイトーン」",
            "将来生ピアノに移行する際のタッチ適応が課題",
          ],
        },
      ]);
      const row2Y = SLIDE.contentY + row1H + gap;
      addCardRow(slide, row2Y, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "補足",
          body: "タッチの違い（軽快 vs 重厚）は、将来生ピアノで演奏する学習者にとって適応上の課題を生じさせる要因となる。",
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;
    }

    case "yamaha-price":
      addTitle(
        slide,
        "料金プラン：堅固な定額課金（サブスクリプション）モデル",
        "入会金 + 月謝 + 運営管理費。半期ごとに数千円のオリジナル教材費が別途発生"
      );
      addTable(
        slide,
        ["教室・コース名", "入会金（税込）", "月謝（税込）", "運営管理費", "レッスン形態・回数"],
        [
          [
            "ヤマハ音楽教室（幼児科等）",
            "5,500〜11,000 円程度",
            "8,250〜11,330 円程度",
            "教室により別途発生",
            "グループ／年 40 回／1 回 50 分",
          ],
          [
            "カワイ 3 歳ソルフェージュ",
            "11,000 円（標準）",
            "8,800 円",
            "月額 220 円程度",
            "個人／月 3 回（年 36 回）／1 回 30 分",
          ],
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        { colW: [3.5, 2.2, 2.2, 1.93, 2.2], rowH: 0.7 }
      );
      slide.addText(
        "※ 別途、半期ごとに数千円のオリジナル教材費が発生する。",
        {
          x: SLIDE.marginX,
          y: SLIDE.contentY + 0.7 * 3 + 0.25,
          w: CONTENT_W,
          h: 0.4,
          fontFace: FONT.body,
          fontSize: TYPOGRAPHY.noteMedium.size,
          color: COLORS.muted,
        }
      );
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;

    case "yamaha-marketing":
      addTitle(
        slide,
        "マーケティング・集客：全国規模の認知獲得と体験フック",
        "全国 TV CM・自社 HP・折込チラシ・看板で広く認知。無料体験／3 ヶ月トライアルで心理的ハードルを下げる"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "主要な集客チャネル",
          body: [
            "全国規模のテレビ CM",
            "自社のホームページ",
            "地域の特約店が実施する折込チラシ",
            "実店舗での看板掲示",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "受講生を引きつけるフック",
          body: [
            "無料体験レッスンの常時実施",
            "入会金・運営管理費が免除される「3 ヶ月トライアルコース」（3 回または 6 回）",
            "平日昼間など特定時間帯対象の「入会金無料キャンペーン」",
            "入会時の心理的ハードルを下げる定期施策",
          ],
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;

    case "yamaha-approach": {
      addTitle(
        slide,
        "「譜読み」に対するアプローチ：徹底した聴覚先行（耳コピ優先）",
        "読譜は独立した技術として教えず、音感育成の「確認ツール」として補助的に扱う"
      );
      const gap = 0.15;
      const card1H = addCardRow(slide, SLIDE.contentY, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "指導ステップ",
          body: [
            "1. 聴いたメロディや歌詞を真似して歌う",
            "2. 正しい音程やリズムを覚える",
            "3. 最後に「その音」と「音符」を一致させて確認する",
          ],
        },
      ]);
      const card2Y = SLIDE.contentY + card1H + gap;
      addCardRow(slide, card2Y, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "帰結",
          body: [
            "読譜の優先度は低く、カリキュラム後半に位置づけられる",
            "譜読みをそれ自体で独立した技術として論理的に教えることはしない",
            "音感を育てるための「確認ツール」としての補助的な扱いに留まる",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;
    }

    case "yamaha-review":
      addTitle(
        slide,
        "ユーザー評判：高い音感の獲得と「譜読み難民」の発生",
        "音感面の評価は高いが、出身者特有の「楽譜を読まずに弾いてしまう」深刻なギャップが残る"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "ポジティブな評価",
          body: [
            "耳が非常に良くなり、聴いた音をすぐにドレミで歌える",
            "簡単な曲なら耳コピで伴奏をつけて弾ける",
            "音楽表現が豊かになる",
            "グループレッスンでアンサンブルの楽しさを体感",
          ],
          opts: { fillColor: COLORS.posBg, borderColor: COLORS.posBorder, titleColor: COLORS.posBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "不満・ギャップ",
          body: [
            "模範演奏を聴くと楽譜を見ずに弾くようになってしまう",
            "演奏レベルが上がった段階で、一人で新曲を譜読みできず苦痛",
            "オンライン振替では楽譜への素早い書き込み・丸つけが不可",
            "タイムラグで連弾やリズム合わせが成立しない",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.yamaha);
      break;

    // ===== 講師育成 =====
    case "trainer-target":
      addTitle(
        slide,
        "ターゲット層：個人ピアノ講師・幼児教育関係者",
        "教室経営の孤独、教材研究の時間負担、初心者向け読譜指導ノウハウの欠如に悩む"
      );
      addBullets(
        slide,
        [
          "メイン：個人ピアノ教室／音楽教室主宰の個人事業主、保育士・幼児教育関係者",
          "幼児や初心者が退屈せずに読譜を学べる指導ノウハウがない",
          "生徒が楽譜を読めず、宿題未実施、レッスン時間が譜読みに圧迫される",
          "教材研究・準備・手作り教具にかかる時間がプライベートを圧迫",
          "孤独な教室経営の中で、指導法・集客を相談できるプラットフォームがない",
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        SLIDE.contentH,
        TYPOGRAPHY.slideBullet
      );
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;

    case "trainer-service": {
      addTitle(
        slide,
        "サービス内容：指導ノウハウ × 教材販売 × 認定資格制度",
        "書籍・養成講座・対談 CD・指導者クラスなど、複数の提供形態が並走する"
      );
      const gap = 0.20;
      const row1H = addCardRow(slide, SLIDE.contentY, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "書籍・教材",
          body: [
            "尾島未佳氏『新しいソルフェージュ指導の教科書』（ヤマハ MEH、2,530 円）",
            "アンサンブル・オーブ「どれみフレンズ」シリーズ（導入期専用）",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "養成講座・認定制度",
          body: [
            "川崎紫明音符ビッツ 指導者養成講座（脳科学ベース・40 年研究）",
            "視覚と聴覚を統合するフラッシュカードメソッド",
          ],
        },
      ]);
      const row2Y = SLIDE.contentY + row1H + gap;
      addCardRow(slide, row2Y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "サブスク型コミュニティ",
          body: [
            "藤拓弘氏「ピアノ講師ラボ」",
            "毎月の対談音声 CD／デジタルデータ送付",
            "ニュースレター、会員限定ホームページ診断",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "指導者クラス（対面）",
          body: [
            "東京藝大名誉教授・小鍛冶邦隆氏監修「NMP アカデミー」",
            "作曲・ソルフェージュ観点での教材分析",
            "半期全 12 回の指導法講義",
          ],
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;
    }

    case "trainer-price":
      addTitle(
        slide,
        "料金プラン：サブスク × 高額養成講座 × 教具販売の組み合わせ",
        "月額型に加え、6〜10 万円台の養成講座と数万円の教材セットが連なるパッケージ型"
      );
      addTable(
        slide,
        ["サービス・教材名", "料金 / 受講料（税込）", "教材費・その他費用", "サービス形態"],
        [
          [
            "ピアノ講師ラボ",
            "月会費 5,500 円（入会金無料キャンペーンあり）",
            "なし",
            "毎月の対談音声 CD、ニュースレター、限定 FB グループ",
          ],
          [
            "川崎紫明音符ビッツ 指導者養成講座",
            "一般：102,000 円／PTNA・スズキ会員：96,000 円",
            "教材費 12,000 円（郵送）／別途大型教材セット 62,000 円等",
            "オンライン（全 11 回・公開 4 日間限定）、准講師認定資格",
          ],
          [
            "NMP アカデミー 指導者クラス",
            "各半期 60,000 円（12 回）",
            "施設利用料別途",
            "対面グループレッスン（1 回 90 分）、実教材の指導法講義",
          ],
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        { colW: [3.0, 2.7, 3.0, 3.33], rowH: 0.95, fontSize: 10 }
      );
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;

    case "trainer-marketing":
      addTitle(
        slide,
        "マーケティング・集客：個人発信メディア × 出版 × 業界団体経由",
        "SNS・YouTube・実用書・PTNA セミナー告知の組み合わせで講師リストを獲得"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "主要な集客チャネル",
          body: [
            "個人アメーバブログ",
            "Instagram、YouTube",
            "主催者自身による実用書の出版（藤拓弘氏、川崎紫明氏 等）",
            "PTNA（全日本ピアノ指導者協会）等を通じたセミナー告知",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "受講生を引きつけるフック",
          body: [
            "書籍プレゼント",
            "過去の人気対談 CD の贈呈",
            "藤拓弘氏との 15 分限定個別 Zoom 無料相談会",
            "無料のオンライン体験セミナー",
            "メールアドレス／LINE 等の見込み顧客リストを獲得",
          ],
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;

    case "trainer-approach":
      addTitle(
        slide,
        "「譜読み」に対するアプローチ：早期からの視覚・聴覚統合学習",
        "単なる音符暗記ではなく、独自メソッドとしての「早期譜読み力」を掲げる"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "音符ビッツ系メソッド",
          body: [
            "ト音・ヘ音記号を網羅したフラッシュカードを高速でめくる",
            "視覚的な音符位置 ×（歌唱による）音高 を瞬時に結合",
            "脳科学的な視覚・聴覚統合学習として設計",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "幼児向け直感理解アプローチ",
          body: [
            "五線譜の「線の上（せん）」と「線の間（かん）」の違い",
            "くだものや動物のキャラクターカードを用いた視覚的理解",
            "実技レッスンのオマケではなく、レッスンのコアバリュー化",
          ],
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;

    case "trainer-review":
      addTitle(
        slide,
        "ユーザー評判：地方からの学習価値とアナログ教具コストへの不満",
        "隙間時間に著名講師のメソッドを学べる一方、ライセンス料・大型教材の負担に不満が集中"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "ポジティブな評価",
          body: [
            "地方在住でも自宅で著名講師の指導法を繰り返し学べる",
            "通勤中の車内・隙間時間に学習可能",
            "音符ビッツ／どれみフレンズ導入で幼児が目の色を変える",
            "宿題を自発的に進めるようになった",
          ],
          opts: { fillColor: COLORS.posBg, borderColor: COLORS.posBorder, titleColor: COLORS.posBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "不満・ギャップ",
          body: [
            "准講師等の資格認定料・年会費・継続ライセンス維持コスト",
            "大型フラッシュカードや教材一式（E セット等）で 6 万円以上の初期投資",
            "教材が物理的に大きく、出張レッスン時の持ち運びに難",
            "自宅教室での保管場所に窮する",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.trainer);
      break;

    // ===== 個人オンライン =====
    case "online-target":
      addTitle(
        slide,
        "ターゲット層：大人の初心者・再開組・独学層",
        "ブランクと独学による「譜読みの遅さ」と「身体操作の不一致」が共通課題"
      );
      addBullets(
        slide,
        [
          "メイン：18 歳以上の趣味の大人初心者、ブランクのある社会人層（やり直しピアノ）、独学者",
          "ブランクで昔読めていた楽譜を読むのに時間がかかる",
          "ヘ音記号・加線の多い音符・複雑な調号で頭が混乱する",
          "両手で弾こうとすると楽譜の同時処理ができず手が止まる",
          "手元（鍵盤）ばかり見てしまい、楽譜を見ながら弾けない（ブラインドタッチが不可）",
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        SLIDE.contentH,
        TYPOGRAPHY.slideBullet
      );
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "online-service":
      addTitle(
        slide,
        "サービス内容：オーダーメイド指導 × スキルシェア × 自習アプリ",
        "統一カリキュラムは持たず、受講生の「弾きたい曲」起点で個別対応。アプリ群が並行利用される"
      );
      addTable(
        slide,
        ["アプリ・ツール名", "料金プラン（税込）", "特徴・対応機能"],
        [
          ["flowkey", "月額 2,100 円程度", "ヤマハ提携。1,500 曲以上、上級〜プロ対応"],
          ["Simply Piano", "月額 1,633 円", "初心者向け、キーボード連動型ピアノ練習ゲーム"],
          [
            "NoteRacer",
            "無料（Pro 800 円／年 3,000 円）",
            "マイクで打鍵音を拾い、読譜速度を競うフラッシュカードゲーム",
          ],
          ["PlayScore2", "無料（一部有料）", "紙の楽譜を撮影してその場で自動演奏する高性能 OCR"],
          ["譜読みトレーニング fuyotore", "980 円（買い切り）", "加線・調号・全 50 レベルの自動めくり機能"],
          [
            "洗足オンラインスクール",
            "無料ソフトウェア提供",
            "「クレ読み」「譜読みの女神」「楽典ウォーズ 3D」等",
          ],
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        { colW: [3.2, 3.0, 5.83], rowH: 0.48, fontSize: 10 }
      );
      slide.addText(
        "※ 自習用に「ブラインドタッチで弾けるおとなのための楽しいピアノスタディ」等の市販教材も併用される。",
        {
          x: SLIDE.marginX,
          y: SLIDE.contentY + 0.48 * 7 + 0.20,
          w: CONTENT_W,
          h: 0.4,
          fontFace: FONT.body,
          fontSize: TYPOGRAPHY.noteSmall.size,
          color: COLORS.muted,
        }
      );
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "online-price":
      addTitle(
        slide,
        "料金プラン：単発レッスン〜集中講座〜楽譜代行までの多段マネタイズ",
        "1,000 円台の単発から 20 万円台の集中まで、価格と提供形態の幅が広い"
      );
      addTable(
        slide,
        ["サービスカテゴリ", "料金相場（税込）", "提供内容・取引体系"],
        [
          ["ストアカ 単発レッスン", "1,000〜2,000 円 / 30 分", "初心者向け体験、30 分で 1 曲弾く体験 等"],
          [
            "ストアカ 集中パッケージ",
            "5,800 円（4 回）〜199,000 円（全 20 回）",
            "短期集中型のカスタマイズピアノレッスン",
          ],
          [
            "ココナラ 指番号書き込み代行",
            "基本 3,500 円（参考動画・音源は各 +3,500 円）",
            "楽譜 PDF に指番号・ペダリングを記入",
          ],
          [
            "ココナラ 耳コピ・楽譜作成",
            "3,000〜10,000 円程度",
            "既存曲の採譜、難易度調整したオリジナルピアノ譜",
          ],
          [
            "島村楽器オンライン 譜読み講座",
            "A：14,300 円/月（月 4 回）／S：24,200 円/月（月 8 回）",
            "入会金 13,200 円、大人向け楽譜の読み方・基本リズム講座",
          ],
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        { colW: [3.5, 3.5, 5.03], rowH: 0.62, fontSize: 10 }
      );
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "online-marketing":
      addTitle(
        slide,
        "マーケティング・集客：プラットフォーム SEO × 個人 SNS 発信",
        "ストアカ・ココナラ内検索、YouTube ノウハウ動画、Instagram リール、解説ブログを軸に展開"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "主要な集客チャネル",
          body: [
            "ストアカ／ココナラ内の検索 SEO（「ピアノ 譜読み」「楽譜 読めない」等）",
            "個人 YouTube チャンネルでのノウハウ動画",
            "Instagram のリール動画",
            "ピアノ初心者向け解説ブログの運営",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "受講生を惹きつける訴求メッセージ",
          body: [
            "指番号を全部書き込み、譜読みに迷う時間を削減",
            "オンライン自習室・家庭教師スタイルで挫折させない",
            "30 分で憧れのショパンが 1 曲弾ける",
            "即効性と手軽さを重視したフック",
          ],
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "online-approach":
      addTitle(
        slide,
        "【重要】譜読みに対するアプローチ：論理化されているが体系化されていない",
        "「模様読み」「ブラインドタッチ」等のコツはあるが、独立した体系プログラムとしての提供は極めて少ない"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "提供されているアプローチ",
          body: [
            "音を 1 音ずつ数えず、音符の連なりをビジュアルパターン認識",
            "線と間の位置から「音が 1 つ上か、3 つ飛びか」を直感判別（模様読み）",
            "短い教本で手のポジションを固定し、鍵盤と指の距離感覚を体得（ブラインドタッチ）",
            "弾く前に「楽譜を音名で歌う」「リズムを机で叩く」の分離アプローチ",
          ],
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "構造的な限界",
          body: [
            "受講生が持ち込んだ課題曲を弾かせるための「手段」として扱われる",
            "レッスンの一部、または導入時のオマケとして口頭でアドバイス",
            "譜読み・ソルフェージュ単独の体系的パッケージプログラムは極めて少ない",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "online-review":
      addTitle(
        slide,
        "ユーザー評判：伴走の安心感と、構造的なオンライン演奏指導の限界",
        "指番号代行・自習室スタイルは好評。一方、回線遅延・音色伝達・環境制約が深刻なボトルネック"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "ポジティブな評価",
          body: [
            "指番号書き込みで譜読みの停滞が消え、練習に集中できる",
            "オンライン自習室で隣に先生が伴走、挫折しない",
            "新しい曲を最後まで読み切れた",
          ],
          opts: { fillColor: COLORS.posBg, borderColor: COLORS.posBorder, titleColor: COLORS.posBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "不満・ギャップ（オンライン特有の深刻なボトルネック）",
          body: [
            "光回線でもコンマ数秒のタイムラグ → 連弾・歌唱伴奏が困難",
            "デジタル圧縮で微細なタッチ・ペダリング・響きが伝わらない",
            "カメラ調整、騒音配慮による電子ピアノの音量と打鍵のミスマッチ",
            "導入期の子供は保護者の付き添いがないとレッスンが成立しない",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.online);
      break;

    case "matrix":
      addTitle(
        slide,
        "競合分析比較マトリクス",
        "強み・弱み・料金帯・メインターゲット・譜読みアプローチを 3 カテゴリで一覧化"
      );
      addTable(
        slide,
        ["競合カテゴリ", "強み", "弱み", "料金帯（目安）", "メインターゲット", "「譜読み」へのアプローチ"],
        [
          [
            "大手音楽教室",
            "全国的なブランド信頼／幼児期の聴く力育成",
            "耳コピ依存で読譜が遅れる／オンライン対応力が弱い",
            "入会金 5.5k〜11k／月謝 8.2k〜11.3k／管理費 220〜1,707 円",
            "4〜5 歳の幼児・小学校低学年と保護者",
            "「きく・うたう」優先後の確認プロセス。独立した体系性なし",
          ],
          [
            "ピアノ講師育成",
            "指導者の熱量とコミュニティ／視覚・聴覚統合の体系化",
            "ライセンス維持コストが高額／大型紙教材で管理煩雑",
            "サブスク 月 5,500 円／養成講座 7.2 万〜10.2 万／別売教材 1.3 万〜6.2 万",
            "個人ピアノ教室主宰、幼児教育関係者、保育士",
            "フラッシュカード・キャラクターでの直感理解。アナログ教具に依存",
          ],
          [
            "個人オンライン講座",
            "移動時間ゼロで低価格／弾きたい曲に合わせた柔軟性",
            "音色ニュアンス・身体操作の指導に技術的限界／属人化",
            "単発 1,000〜3,000 円／集中パック 5,800〜199,000 円／代行 3,500 円〜",
            "趣味の大人初心者、再開組、独学層",
            "ブラインドタッチ・模様読みを個別指導。決まった教材なし",
          ],
        ],
        SLIDE.marginX,
        SLIDE.contentY,
        CONTENT_W,
        { colW: [1.5, 2.0, 2.0, 2.3, 1.7, 2.53], rowH: 1.20, fontSize: 9 }
      );
      addFooter(slide, page, TOTAL, sectionLabels.matrix);
      break;

    // ===== 結論 =====
    case "conclusion-1": {
      addTitle(
        slide,
        "1. 「タイムラグ不問」の譜読み・ソルフェージュ特化を確立",
        "音を聴く・合わせる対面型実技を完全に捨て、認知操作トレーニングに振り切る"
      );
      const gap = 0.15;
      const card1H = addCardRow(slide, SLIDE.contentY, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "捨てる領域",
          body: [
            "回線遅延／デジタル圧縮による音質劣化に左右される「リアルタイム演奏指導」",
            "音を合わせる・微細な音色を聴き取る対面型実技",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
      ]);
      const card2Y = SLIDE.contentY + card1H + gap;
      addCardRow(slide, card2Y, [
        {
          x: SLIDE.marginX,
          w: CONTENT_W,
          title: "取りに行く領域",
          body: [
            "音符位置の瞬時認識／調号・和音の論理解読 ＝ 非同期でも成立する認知操作",
            "画面共有によるビジュアル重視のクイズ授業",
            "動画提出による添削型プログラム",
            "タイムラグを完全に不問とし、オンラインでも高満足度を実現",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.conclusion);
      break;
    }

    case "conclusion-2":
      addTitle(
        slide,
        "2. 大手卒業生の「耳コピ依存脱却・譜読み自立パッケージ」",
        "大手が長年解決できていない「最大の顧客の痛み」をそのまま集客フックに転換する"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "ターゲットの痛み",
          body: [
            "ヤマハ・カワイ出身の「耳が極めて良いが楽譜が読めない」ジュニア期生徒",
            "幼児期に育てた音感が、児童期には読譜の阻害要因になる",
            "大手の体系では構造的に解消できない副作用（譜読み難民）",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "提供する解",
          body: [
            "「耳コピ依存から自立するロジカル読譜マスターコース」を開発",
            "既存の「聴こえるドレミ」を「五線の視覚記号」へ論理的にブリッジ",
            "大手の卒業生／在籍生をそのまま自社事業の集客流入として活用",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.conclusion);
      break;

    case "conclusion-3":
      addTitle(
        slide,
        "3. ピアノ講師向け：紙の教具を不要にする完全デジタル教材のサブスク",
        "アナログ高額囲い込みモデルから、個人講師の指導現場をそのまま奪取する"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "既存モデルの負担",
          body: [
            "高額な養成費用・年会費・継続ライセンス",
            "数万円規模の大型フラッシュカードや教材セット",
            "出張レッスンでの持ち運び・教室での保管場所",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "提供する解",
          body: [
            "タブレット／PC／プロジェクター画面に映すだけで導入可能",
            "完全デジタル化されたソルフェージュ教材・アプリのサブスク提供",
            "「1 レッスン 5 分の指導法コンサルティング」をセット化",
            "初期投資ゼロ／管理ストレスゼロで顧客を奪取",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.conclusion);
      break;

    case "conclusion-4":
      addTitle(
        slide,
        "4. 大人の再開組向け：模様読み × ブラインドタッチを段階的自立ワークブック化",
        "「書き込み代行」が阻害している自立的読譜を、段階的ガイド消去型ドリルで習得させる"
      );
      addCardRow(slide, TWO_COL.y, [
        {
          x: TWO_COL.leftX,
          w: TWO_COL.colW,
          title: "既存サービスの構造課題",
          body: [
            "ココナラの「指番号・ドレミ全書き込み」は短期的には便利",
            "結局「書き込まないと弾けない」状態が固定化し、自立的読譜を阻害",
            "教材は属人化し、決まった体系もない",
          ],
          opts: { fillColor: COLORS.negBg, borderColor: COLORS.negBorder, titleColor: COLORS.negBorder },
        },
        {
          x: TWO_COL.rightX,
          w: TWO_COL.colW,
          title: "提供する解",
          body: [
            "模様読み（音程の物理的距離パターン認識）を徹底的にロジック化",
            "ブラインドタッチ（指のポジション変化抑制）の段階訓練",
            "初期はガイドがフル表示、ドリル進行で段階的に消えるデジタル連動教材",
            "最終的に「真っ白な楽譜を自力でブラインドタッチで弾ける」状態に到達",
          ],
          opts: { fillColor: COLORS.accentLight, borderColor: COLORS.accent, titleColor: COLORS.accent },
        },
      ]);
      addFooter(slide, page, TOTAL, sectionLabels.conclusion);
      break;

    default:
      slide.addText(`未実装: ${spec.kind}`, {
        x: 1,
        y: 3,
        w: 11,
        h: 1,
        fontFace: FONT.body,
        fontSize: TYPOGRAPHY.todo.size,
        color: COLORS.negBorder,
      });
      addFooter(slide, page, TOTAL, "要確認");
  }
});

pptx.writeFile({ fileName: "output.pptx" }).then((file) => {
  console.log(`Generated: ${file}`);
});
