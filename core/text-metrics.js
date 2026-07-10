// core/text-metrics.js
// テキスト寸法の推定ロジック（テーマ非依存）。
//
// pptxgenjs にはテキストの実描画幅・高さを測定する API が無いため、
// フォントサイズと文字種から折り返し行数・本文高さを描画前に推定する。
// 本モジュールが提供するのは計算式のみで、フィッティング値
// （charWMultiplier / heightSafety 等）は各テーマの tokens 側が持つ。

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

// body（bullet 配列または段落文字列）の描画高さを見積もる。
// tokens には次のキーを要求する:
//   TYPOGRAPHY.cardBullet / TYPOGRAPHY.cardBody … { size, lineSpacing, paraSpaceAfterPt? }
//   CARD.bulletIndentIn / CARD.charWMultiplier / CARD.heightSafety
function estimateBodyHeight(body, innerW, tokens) {
  const { TYPOGRAPHY, CARD } = tokens;
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

module.exports = { visualCharWidth, estimateBodyHeight };
