// themes/pastel/theme.js
// pastel テーマのエントリポイント。
// 参照デザイン（パステル調・イラスト枠つきの事業紹介資料）のトレースから起こしたテーマ。
// 背景は白固定。画像・イラスト位置はすべて「画像スロット」（src 未指定なら破線プレースホルダ）。
module.exports = {
  name: "pastel",
  tokens: require("./tokens"),
  parts: require("./parts"),
  kinds: {
    // 構造系
    "title-slide":     require("./kinds/title-slide"),
    "section-divider": require("./kinds/section-divider"),
    // カード系
    "image-cards":     require("./kinds/image-cards"),
    "before-after":    require("./kinds/before-after"),
    "lead-visual":     require("./kinds/lead-visual"),
    // 対応・展開系
    "mapping-rows":    require("./kinds/mapping-rows"),
    "circle-chain":    require("./kinds/circle-chain"),
    "timeline":        require("./kinds/timeline"),
    // 表系
    "matrix-table":    require("./kinds/matrix-table"),
    "spec-rows":       require("./kinds/spec-rows"),
    "step-matrix":     require("./kinds/step-matrix"),
    // 一点物系
    "hub-spokes":      require("./kinds/hub-spokes"),
    "contact":         require("./kinds/contact"),
  },
};
