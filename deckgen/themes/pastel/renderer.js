// themes/pastel/renderer.js
// pastel テーマの CLI エントリポイント。
// 使い方: node themes/pastel/renderer.js <deck.js> <out.pptx>
const { run } = require("../../core/engine");

run(require("./theme"), process.argv);
