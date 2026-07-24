// kind: bullets — 全幅の箇条書きスライド。
// コンテンツ領域全面にカードと同じ枠線なしのグレー背景（bgSubtle）を敷き、
// その内側に箇条書きを配置する。背景の大きさは items の量によらず固定。
const { COLORS, SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle, addBullets } = require("../parts");
const { ShapeType } = require("../../../core/engine");

// 枠内側の余白
const PAD_SIDE = 0.35;
const PAD_TOP = 0.30;
const PAD_BOTTOM = 0.30;

module.exports = function renderBullets(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  slide.addShape(ShapeType.rect, {
    x: SLIDE.marginX,
    y: SLIDE.contentY,
    w: CONTENT_W,
    h: SLIDE.contentH,
    fill: { color: COLORS.bgSubtle },
    line: { type: "none" },
  });
  addBullets(
    slide,
    spec.items,
    SLIDE.marginX + PAD_SIDE,
    SLIDE.contentY + PAD_TOP,
    CONTENT_W - PAD_SIDE * 2,
    SLIDE.contentH - PAD_TOP - PAD_BOTTOM,
    TYPOGRAPHY.slideBullet
  );
};
