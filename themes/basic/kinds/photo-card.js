// kind: photo-card — 右に写真、左にカード（箇条書き）の事例紹介レイアウト。
// 幅比は写真:カード = 6:4。間に gap を挟む。写真は 4:3 をベースに
// sizing: contain で枠内に収める（エリア比 (≈1.45) が 4:3 (≈1.33) より
// 横長のため、左右に薄く余白が出る）。
const path = require("path");
const { SLIDE, CONTENT_W } = require("../tokens");
const { addTitle, addCard } = require("../parts");
const { variantOpts } = require("./_shared");

module.exports = function renderPhotoCard(slide, spec, ctx) {
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

  const imgPath = path.resolve(ctx.deckDir, spec.image.src);
  slide.addImage({
    path: imgPath,
    x: photoX, y, w: photoW, h,
    sizing: { type: "contain", w: photoW, h },
  });
};
