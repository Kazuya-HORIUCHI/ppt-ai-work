// themes/basic/theme.js
// basic テーマのエントリポイント。core/engine.js が受け取る
// { name, tokens, parts, kinds } を組み立てる。
//
// kinds は「このテーマがサポートする kind」の manifest を兼ねる。
// ここに登録されていない kind は engine がプレースホルダ描画にフォールバックする。
module.exports = {
  name: "basic",
  tokens: require("./tokens"),
  parts: require("./parts"),
  kinds: {
    // 構造系
    "title-slide":     require("./kinds/title-slide"),
    "section-divider": require("./kinds/section-divider"),
    // テキスト系
    "bullets":         require("./kinds/bullets"),
    "key-takeaway":    require("./kinds/key-takeaway"),
    "data-table":      require("./kinds/data-table"),
    // 比較系
    "comparison-2":    require("./kinds/comparison-2"),
    "trio":            require("./kinds/trio"),
    "panel-cards":     require("./kinds/panel-cards"),
    "panel-bullets":   require("./kinds/panel-bullets"),
    // 写真系
    "photo-card":      require("./kinds/photo-card"),
    // 図形系
    "flow-diagram":    require("./kinds/flow-diagram"),
    "process-stages":  require("./kinds/process-stages"),
    "matrix-2x2":      require("./kinds/matrix-2x2"),
    "pyramid":         require("./kinds/pyramid"),
  },
};
