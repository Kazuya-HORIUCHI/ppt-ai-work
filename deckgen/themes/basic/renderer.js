// themes/basic/renderer.js
// basic テーマの CLI エントリポイント。
// 使い方: node themes/basic/renderer.js <deck.js> <out.pptx>
//
// 実処理はテーマ非依存の core/engine.js と、basic テーマの実装
// （theme.js = tokens + parts + kinds）に分離されている。
const { run } = require("../../core/engine");

run(require("./theme"), process.argv);
