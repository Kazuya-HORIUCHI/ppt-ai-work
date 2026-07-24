// kind: before-after — Before / After の 2 パネル対比 + 大矢印。
// 各パネルは「アイコン画像スロット + 短文」の行を縦に並べる。emphasis: true の行は
// 破線セパレータの下に強調色で表示する（参照デザインの「▼ 結果」行）。
// 任意で右側に円形画像 + キャプション（aside）を置ける。
const { COLORS, FONT, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addRoundBox, addImageSlot } = require("../parts");
const { resolveImage, drawImage } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

const STYLES = {
  before: { fill: "F2F4F6", titleColor: "6B7684", strong: "6B7684" },
  after:  { fill: "EAF2EC", titleColor: "5E9475", strong: "4A7BA6" },
};

module.exports = function renderBeforeAfter(slide, spec, ctx) {
  const { drawHeader } = require("./_shared");
  drawHeader(slide, spec, ctx);

  const hasAside = !!spec.aside;
  const arrowW = 0.62;
  const gap = 0.30;
  const panelW = hasAside ? 4.28 : 5.55;
  const asideW = hasAside ? CONTENT_W - panelW * 2 - arrowW - gap * 2 : 0;
  const totalW = panelW * 2 + arrowW + (hasAside ? gap * 2 + asideW : 0);
  const x0 = SLIDE.marginX + (CONTENT_W - totalW) / 2;
  const panelY = SLIDE.contentY + 0.08;
  const panelH = SLIDE.contentH - 0.25;

  drawPanel(slide, ctx, x0, panelY, panelW, panelH, spec.before, STYLES.before);
  slide.addShape(ShapeType.rightArrow, {
    x: x0 + panelW + 0.05,
    y: panelY + panelH / 2 - 0.42,
    w: arrowW - 0.1,
    h: 0.84,
    fill: { color: COLORS.arrow },
    line: { type: "none" },
  });
  drawPanel(slide, ctx, x0 + panelW + arrowW, panelY, panelW, panelH, spec.after, STYLES.after);

  if (hasAside) {
    const ax = x0 + panelW * 2 + arrowW + gap;
    const d = Math.min(asideW - 0.1, 2.6);
    drawImage(slide, ctx, spec.aside.image, {
      x: ax + (asideW - d) / 2,
      y: panelY + 0.35,
      w: d,
      h: d,
      shape: "circle",
    });
    if (spec.aside.caption) {
      slide.addText(spec.aside.caption, {
        x: ax, y: panelY + 0.35 + d + 0.25, w: asideW, h: 1.3,
        fontFace: FONT.body,
        fontSize: 13,
        color: COLORS.accent,
        align: "center",
        valign: "top",
        lineSpacingMultiple: 1.5,
      });
    }
  }
};

function drawPanel(slide, ctx, x, y, w, h, panel, style) {
  addRoundBox(slide, x, y, w, h, { fillColor: style.fill, rectRadius: 0.12 });
  slide.addText(panel.title, {
    x: x + 0.35, y: y + 0.18, w: w - 0.7, h: 0.45,
    fontFace: FONT.body, fontSize: 16, bold: true,
    color: style.titleColor, align: "left", valign: "middle",
  });

  const items = panel.items;
  const top = y + 0.75;
  const availH = h - 0.95;
  const rowH = Math.min(1.0, availH / items.length);
  items.forEach((item, i) => {
    const ry = top + i * rowH;
    if (item.emphasis) {
      // 破線セパレータ（行の上端）
      slide.addShape(ShapeType.line, {
        x: x + 0.3, y: ry + 0.02, w: w - 0.6, h: 0,
        line: { color: COLORS.border, width: 1, dashType: "dash" },
      });
    }
    const iconS = 0.55;
    const { imgPath, label } = resolveImage(ctx, item.image);
    addImageSlot(slide, {
      x: x + 0.3, y: ry + (rowH - iconS) / 2, w: iconS, h: iconS,
      imgPath, label: label || "icon",
    });
    slide.addText(item.text, {
      x: x + 1.02, y: ry, w: w - 1.3, h: rowH,
      fontFace: FONT.body,
      fontSize: 11.5,
      bold: !!item.emphasis,
      color: item.emphasis ? style.strong : COLORS.text,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.25,
    });
  });
}
