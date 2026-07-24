// core/engine.js
// セマンティック・スロット方式のスライド生成エンジン（テーマ非依存）。
//
// テーマ（themes/<name>/theme.js）から { name, tokens, parts, kinds } を受け取り、
// deck.js を読み込んで各 slide を kinds registry で dispatch し .pptx を生成する。
//
// 本モジュールが持つのは「テーマによらない契約」のみ:
//   - CLI 引数の解釈と deck の読み込み
//   - スライドループと kind dispatch（未登録 kind はプレースホルダ描画へフォールバック）
//   - footer のポリシー（title-slide: 出さない / section-divider: ページ番号のみ /
//     その他: deck.sections[spec.section]、未解決なら「要確認」を表示）
// 見た目に関わる描画はすべて theme.parts / theme.kinds 側の責務。

const path = require("path");
const pptxgen = require("pptxgenjs");

// pptxgenjs v4 では ShapeType がインスタンス側にしか公開されていないため、
// モジュールロード時に空インスタンスを 1 つだけ生成して enum を取り出す。
const ShapeType = new pptxgen().ShapeType;

// spec から footer に表示するセクション文字列を解決する。
// null を返す場合は footer 自体を描画しない（title-slide）。
// "" を返す場合はセクション名なしの footer（section-divider）。
// 未解決の section キーは「要確認」を表示する（バグの早期発見用）。
function sectionLabel(deck, spec) {
  if (spec.kind === "title-slide") return null;
  if (spec.kind === "section-divider") return "";
  return deck.sections[spec.section] ?? "要確認";
}

// theme: { name, tokens, parts, kinds }
//   kinds は { [kindName]: (slide, spec, ctx) => void } の registry。
//   このテーマがサポートする kind の manifest を兼ねる。
// argv: process.argv（[node, script, <deck.js>, <out.pptx>]）
function run(theme, argv) {
  const [, , deckArg, outArg] = argv;
  if (!deckArg || !outArg) {
    console.error(`Usage: node deckgen/themes/${theme.name}/renderer.js <deck.js> <out.pptx>`);
    process.exit(1);
  }
  const deck = require(path.resolve(deckArg));

  const pptx = new pptxgen();
  const { SLIDE } = theme.tokens;
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "CUSTOM_WIDE";
  pptx.title = deck.meta.title;

  // kind renderer へ渡す共有コンテキスト。
  // deckDir は photo-card 等が画像の相対パスを解決する基準ディレクトリ。
  const ctx = {
    deck,
    deckDir: path.dirname(path.resolve(deckArg)),
  };

  const total = deck.slides.length;
  deck.slides.forEach((spec, idx) => {
    const slide = pptx.addSlide();
    const render = theme.kinds[spec.kind];
    if (render) {
      render(slide, spec, ctx);
    } else {
      theme.parts.addUnimplementedPlaceholder(slide, spec.kind);
    }
    const section = sectionLabel(deck, spec);
    if (section !== null) {
      theme.parts.addFooter(slide, idx + 1, total, section);
    }
  });

  return pptx.writeFile({ fileName: outArg }).then((file) => {
    console.log(`Generated: ${file}`);
  });
}

module.exports = { run, ShapeType };
