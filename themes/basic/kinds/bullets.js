// kind: bullets — 全幅の箇条書きのみのスライド。
const { SLIDE, CONTENT_W, TYPOGRAPHY } = require("../tokens");
const { addTitle, addBullets } = require("../parts");

module.exports = function renderBullets(slide, spec) {
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
};
