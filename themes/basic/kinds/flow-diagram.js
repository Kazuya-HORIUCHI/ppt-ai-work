// kind: flow-diagram — A → B → C の直列フロー。各ステップに短い説明を付ける。
//
// 配置:
//   - steps が 4 個以下: 1 列の横並び（従来レイアウト）
//   - steps が 5 個以上: 2 列の U ターン配置（上段を左→右、右端で折り返して
//     下段を右→左）。最大 8 個まで
//   - 上下の余白は、従来レイアウト（boxH 2.0 のときの top 1.2 / bottom 1.65）と
//     同じ比率になるよう、行構成に応じて再計算する
const { COLORS, SLIDE, CONTENT_W } = require("../tokens");
const { addTitle } = require("../parts");
const { drawLabeledBox } = require("./_shared");
const { ShapeType } = require("../../../core/engine");

// ボックス高。従来の 2.0 in から 20% 縮小した値。
const BOX_H = 1.6;
// コンテンツ領域の空き（contentH - 使用高）を上下に配分する際の上側比率。
// 従来レイアウト（top 1.2 / bottom 1.65、空き 2.85）の比率を維持する。
const TOP_RATIO = 1.2 / 2.85;
// 2 列配置の行間。U ターンの下向き矢印を通す。
const ROW_GAP = 0.55;
// 1 列に収める最大ステップ数。5 個以上は U ターンの 2 列配置に切り替える。
const MAX_SINGLE_ROW = 4;

const ARROW_W = 0.5;
const ARROW_H = 0.4;

module.exports = function renderFlowDiagram(slide, spec) {
  addTitle(slide, spec.title, spec.message);
  const n = spec.steps.length;
  if (n <= MAX_SINGLE_ROW) {
    renderSingleRow(slide, spec.steps);
  } else {
    renderUTurn(slide, spec.steps);
  }
};

function renderSingleRow(slide, steps) {
  const n = steps.length;
  const boxW = (CONTENT_W - ARROW_W * (n - 1)) / n;
  const y = SLIDE.contentY + (SLIDE.contentH - BOX_H) * TOP_RATIO;
  for (let i = 0; i < n; i++) {
    const x = SLIDE.marginX + i * (boxW + ARROW_W);
    drawLabeledBox(slide, x, y, boxW, BOX_H, steps[i].label, steps[i].description);
    if (i < n - 1) {
      slide.addShape(ShapeType.rightArrow, {
        x: x + boxW, y: y + (BOX_H - ARROW_H) / 2, w: ARROW_W, h: ARROW_H,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
  }
}

// 2 列の U ターン配置。
// 上段: 左 → 右（cols 個）、右端の箱の直下へ下向き矢印で折り返し、
// 下段: 右 → 左（残り）。下段が上段より少ない場合は右詰めになる
// （右端の列から左へ埋まる）ため、フローの連続性が視覚的に保たれる。
function renderUTurn(slide, steps) {
  const n = steps.length;
  const cols = Math.ceil(n / 2);
  const boxW = (CONTENT_W - ARROW_W * (cols - 1)) / cols;
  const usedH = BOX_H * 2 + ROW_GAP;
  const yTop = SLIDE.contentY + (SLIDE.contentH - usedH) * TOP_RATIO;
  const yBottom = yTop + BOX_H + ROW_GAP;

  const colX = (col) => SLIDE.marginX + col * (boxW + ARROW_W);

  for (let i = 0; i < n; i++) {
    const row = i < cols ? 0 : 1;
    // 上段は左から col 0..cols-1、下段は右端 (cols-1) から左へ戻る。
    const col = row === 0 ? i : cols - 1 - (i - cols);
    const x = colX(col);
    const y = row === 0 ? yTop : yBottom;
    drawLabeledBox(slide, x, y, boxW, BOX_H, steps[i].label, steps[i].description);

    if (row === 0 && i < cols - 1) {
      // 上段の隣接ボックス間: 右向き矢印
      slide.addShape(ShapeType.rightArrow, {
        x: x + boxW, y: yTop + (BOX_H - ARROW_H) / 2, w: ARROW_W, h: ARROW_H,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
    if (i === cols - 1 && n > cols) {
      // U ターン: 上段右端の直下に下向き矢印
      slide.addShape(ShapeType.downArrow, {
        x: x + boxW / 2 - ARROW_H / 2, y: yTop + BOX_H, w: ARROW_H, h: ROW_GAP,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
    if (row === 1 && i < n - 1) {
      // 下段の隣接ボックス間: 左向き矢印（次のボックスは左隣）
      slide.addShape(ShapeType.leftArrow, {
        x: x - ARROW_W, y: yBottom + (BOX_H - ARROW_H) / 2, w: ARROW_W, h: ARROW_H,
        fill: { color: COLORS.accent }, line: { type: "none" },
      });
    }
  }
}
