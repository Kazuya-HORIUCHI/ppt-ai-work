// themes/pastel/output/deck.example.js
// pastel テーマの全 kind を網羅したサンプル deck。renderer の動作確認と
// 各 kind のフィールド埋め方のリファレンスを兼ねる。
// 画像スロットはすべて src 未指定（破線プレースホルダ表示）。
// 各 image: { label } に src を追加すれば埋め込まれる（deck.js 基準の相対パス）。
//
// 実行 (リポジトリルートから):
//   node deckgen/themes/pastel/renderer.js deckgen/themes/pastel/output/deck.example.js deckgen/themes/pastel/output/deck.example.pptx

module.exports = {
  meta: {
    title: "サンプル資料 — pastel テーマ全 kind の表示確認",
    eyebrow: "テンプレ動作確認",
    heading: "pastel テーマ\n全 kind デモ",
    subtitle: "lead-visual / image-cards / before-after / timeline / matrix 系 ほか",
    meta: "作成日: 2026-07-24",
  },

  // section キー → footer に表示するセクションラベル
  sections: {
    visual: "ビジュアル系の例",
    compare: "対比・マッピング系の例",
    flow: "フロー・時系列系の例",
    table: "表・マトリクス系の例",
    closing: "クロージング系の例",
  },

  slides: [
    // ============== 構造系 ==============
    { kind: "title-slide" },

    {
      kind: "section-divider",
      label: "Part 1",
      title: "ビジュアル系の例",
      subtitle: "lead-visual / image-cards",
    },

    // ---- lead-visual: リード文 + メイン画像 + 特徴帯 ----
    {
      kind: "lead-visual",
      section: "visual",
      title: "lead-visual の例",
      lead: "リード文をここに書きます。\n2〜3 行程度のメッセージと、メイン画像・特徴の帯で構成されます。",
      image: { label: "メインビジュアル" },
      features: [
        { image: { label: "特徴 1" }, caption: "特徴キャプション\n（2 行まで）" },
        { image: { label: "特徴 2" }, caption: "アイコン画像と\n短い説明" },
        { image: { label: "特徴 3" }, caption: "3〜4 件が\n収まりやすい" },
        { image: { label: "特徴 4" }, caption: "画像は label で\nプレースホルダ" },
      ],
    },

    // ---- image-cards: 画像付きカード（flow 矢印あり） ----
    {
      kind: "image-cards",
      section: "visual",
      title: "image-cards の例（flow: true）",
      message: "flow: true にするとカード間に矢印が入り、時系列・段階の表現になります。",
      flow: true,
      cards: [
        {
          title: "ステップ 1",
          image: { label: "画像スロット" },
          body: "body は文字列。\n改行で行を分けます。",
        },
        {
          title: "ステップ 2",
          image: { label: "画像スロット" },
          body: ["body は配列も可", "配列は箇条書きになる"],
          conclusion: "conclusion で強調行",
        },
        {
          title: "ステップ 3",
          image: { label: "画像スロット" },
          body: "カードは 3〜4 枚が\n収まりやすい",
        },
        {
          title: "ステップ 4",
          image: { label: "画像スロット" },
          body: "最後のカードで\n結論に落とす",
        },
      ],
    },

    // ---- image-cards: variant + summary 帯 ----
    {
      kind: "image-cards",
      section: "visual",
      title: "image-cards の例（variant + summary）",
      cards: [
        {
          title: "カード 1",
          image: { label: "画像スロット" },
          body: ["variant 未指定", "パレットは自動ローテーション"],
          conclusion: "conclusion 行",
        },
        {
          title: "カード 2",
          image: { label: "画像スロット" },
          body: ["variant: \"yellow\" 等で", "パレット色を固定できる"],
          variant: "yellow",
        },
        {
          title: "カード 3",
          image: { label: "画像スロット" },
          body: ["blue / yellow / pink", "green / purple が指定可"],
          variant: "green",
        },
      ],
      summary: {
        text: "summary を付けると下部にまとめ帯が出ます。\n2 行程度のまとめ文と小さな画像スロットを置けます。",
        image: { label: "まとめアイコン" },
      },
    },

    {
      kind: "section-divider",
      label: "Part 2",
      title: "対比・マッピング系の例",
      subtitle: "before-after / mapping-rows / hub-spokes",
    },

    // ---- before-after: 2 パネル対比 + aside ----
    {
      kind: "before-after",
      section: "compare",
      title: "before-after の例",
      message: "message はタイトル下のサブメッセージです。",
      before: {
        title: "Before",
        items: [
          { text: "各行はテキスト + アイコン画像", image: { label: "アイコン" } },
          { text: "3〜4 行が収まりやすい", image: { label: "アイコン" } },
          { text: "emphasis: true の行は強調表示", image: { label: "アイコン" }, emphasis: true },
        ],
      },
      after: {
        title: "After",
        items: [
          { text: "After 側は淡緑パネルになる", image: { label: "アイコン" } },
          { text: "行数は左右で揃えると見やすい", image: { label: "アイコン" } },
          { text: "結果の行を強調する", image: { label: "アイコン" }, emphasis: true },
        ],
      },
      aside: {
        image: { label: "補足ビジュアル" },
        caption: "aside は省略可。\n付けると右側に円形画像と\nキャプションが出ます。",
      },
    },

    // ---- mapping-rows: 左右の行を対応付け ----
    {
      kind: "mapping-rows",
      section: "compare",
      title: "mapping-rows の例",
      left: {
        title: "左カラム（課題など）",
        rows: [
          {
            title: "行タイトル 1",
            body: ["body は配列で箇条書き", "2〜3 件まで"],
            image: { label: "アイコン" },
            variant: "pink",
          },
          {
            title: "行タイトル 2",
            body: ["variant で行の色を指定", "pink / yellow / green / blue"],
            image: { label: "アイコン" },
            variant: "yellow",
          },
          {
            title: "行タイトル 3",
            body: "body は文字列でも可\n改行で行を分ける",
            image: { label: "アイコン" },
            variant: "green",
          },
        ],
      },
      right: {
        title: "右カラム（解決策など）",
        rows: [
          {
            title: "対応行 1",
            body: "左の行と同じ数だけ\n並べると対応が伝わる",
            image: { label: "アイコン" },
          },
          {
            title: "対応行 2",
            body: "右カラムは variant 省略で\n自動ローテーション",
            image: { label: "アイコン" },
          },
          {
            title: "対応行 3",
            body: "行数は 3〜4 が上限目安",
            image: { label: "アイコン" },
          },
        ],
      },
    },

    // ---- hub-spokes: 中心 + 放射 ----
    {
      kind: "hub-spokes",
      section: "compare",
      title: "hub-spokes の例",
      lead: "lead は上部の呼びかけ文。hub を中心に spokes が放射状に並びます。",
      hub: {
        title: "中心テーマ",
        subtitle: "hub には title / subtitle /\n画像スロットを置ける",
        image: { label: "中心画像" },
      },
      spokes: [
        { title: "スポーク 1", description: "説明は 1〜2 行の短文", image: { label: "アイコン" }, variant: "blue" },
        { title: "スポーク 2", description: "variant でパレット色を指定", image: { label: "アイコン" }, variant: "green" },
        { title: "スポーク 3", description: "6〜7 件が収まりやすい", image: { label: "アイコン" }, variant: "yellow" },
        { title: "スポーク 4", description: "画像は label のみで", image: { label: "アイコン" }, variant: "pink" },
        { title: "スポーク 5", description: "プレースホルダ表示になる", image: { label: "アイコン" }, variant: "purple" },
        { title: "スポーク 6", description: "footer で締めの一文", image: { label: "アイコン" }, variant: "blue" },
      ],
      footer: "footer は下部の帯。全体を締めるメッセージを置きます。",
    },

    {
      kind: "section-divider",
      label: "Part 3",
      title: "フロー・時系列系の例",
      subtitle: "circle-chain / timeline",
    },

    // ---- circle-chain: 円形ノードのチェーン ----
    {
      kind: "circle-chain",
      section: "flow",
      title: "circle-chain の例",
      lead: "lead は省略可。円形の画像ノードを矢印でつなぎ、展開・広がりを表現します（最大 7 ノード）。",
      nodes: [
        { label: "ノード 1", image: { label: "画像" } },
        { label: "ノード 2", image: { label: "画像" } },
        { label: "改行も\n使える", image: { label: "画像" } },
        { label: "ノード 4", image: { label: "画像" } },
        { label: "ノード 5", image: { label: "画像" } },
      ],
      summary: {
        text: "summary は省略可。チェーン全体のまとめを下部の帯に置けます。",
        image: { label: "まとめアイコン" },
      },
    },

    // ---- timeline: ステップの時系列 ----
    {
      kind: "timeline",
      section: "flow",
      header: "bar",
      title: "timeline の例（header: \"bar\"）",
      steps: [
        {
          label: "ステップ 1",
          description: "header: \"bar\" にすると見出しが番号バッジではなく縦バー付きになります",
          image: { label: "画像スロット" },
        },
        {
          label: "ステップ 2",
          description: "label は短く、description で 1〜2 行の説明を書きます",
          image: { label: "画像スロット" },
        },
        {
          label: "ステップ 3",
          description: "ステップは 3〜4 件が収まりやすい",
          image: { label: "画像スロット" },
        },
        {
          label: "ステップ 4",
          description: "最後のステップで到達点を示す",
          image: { label: "画像スロット" },
        },
      ],
    },

    {
      kind: "section-divider",
      label: "Part 4",
      title: "表・マトリクス系の例",
      subtitle: "matrix-table / spec-rows / step-matrix",
    },

    // ---- matrix-table: 案 × 観点の比較マトリクス ----
    {
      kind: "matrix-table",
      section: "table",
      header: "bar",
      title: "matrix-table の例",
      columns: [
        { title: "案 A" },
        { title: "案 B", variant: "green" },
        { title: "案 C", variant: "yellow" },
      ],
      rows: [
        {
          label: "観点 1",
          icon: { label: "的" },
          cells: [
            { text: "セルは text + 画像の形式", image: { label: "画像" } },
            { text: "列ごとに比較して書く", image: { label: "画像" } },
            { text: "3 列までが目安", image: { label: "画像" } },
          ],
        },
        {
          label: "観点 2",
          icon: { label: "箱" },
          cells: [
            { items: ["items 配列で", "箇条書きセルも可"], image: { label: "画像" } },
            { items: ["行ごとにセルの", "形式を変えられる"], image: { label: "画像" } },
            { items: ["文字列だけでも可"], image: { label: "画像" } },
          ],
        },
        { label: "観点 3", icon: { label: "¥" }, cells: ["高", "中", "低"] },
        { label: "観点 4", icon: { label: "グラフ" }, cells: ["少量", "中量", "多量"] },
        { label: "観点 5", icon: { label: "!" }, cells: ["セルは短文で\n改行も使える", "行数が多いときは\n文字数を絞る", "5〜7 行が上限目安"] },
      ],
    },

    // ---- spec-rows: ラベル + 本文 + 画像の仕様行 ----
    {
      kind: "spec-rows",
      section: "table",
      header: "bar",
      title: "spec-rows の例",
      rows: [
        {
          label: "項目 1",
          icon: { label: "的" },
          text: "text は文字列。\n改行で 2 行にできます。",
          image: { label: "画像" },
        },
        {
          label: "項目 2",
          icon: { label: "本" },
          text: ["text は配列も可", "配列は箇条書きになる", "3〜5 件まで"],
          image: { label: "画像" },
        },
        { label: "項目 3", icon: { label: "¥" }, text: "image は省略可" },
        { label: "項目 4", icon: { label: "グラフ" }, text: "行数は 5〜8 行が目安", image: { label: "画像" } },
        { label: "項目 5", icon: { label: "!" }, text: "icon の label は 1〜3 文字程度の短い語にする", image: { label: "画像" } },
      ],
    },

    // ---- step-matrix: 段階 × 観点のマトリクス ----
    {
      kind: "step-matrix",
      section: "table",
      header: "bar",
      title: "step-matrix の例",
      columns: ["観点 A", "観点 B", "観点 C"],
      steps: [
        {
          label: "段階 1",
          sublabel: "sublabel で補足",
          cells: ["文字列セル", ["配列セルは", "箇条書きになる"], ["観点ごとに", "形式を選べる"]],
        },
        {
          label: "段階 2",
          sublabel: "variant で色指定",
          variant: "green",
          cells: ["¥0", ["セル内の件数は", "2〜4 件まで"], ["短文で書く"]],
        },
        {
          label: "段階 3",
          sublabel: "段階は 4〜5 件が目安",
          variant: "yellow",
          cells: ["改行も\n使える", ["上の段階から", "積み上げる構成に"], ["note で全体を締める"]],
        },
      ],
      note: "note は省略可。マトリクス全体のまとめを下部に置けます。",
    },

    {
      kind: "section-divider",
      label: "Part 5",
      title: "クロージング系の例",
      subtitle: "contact",
    },

    // ---- contact: 連絡先 + メインビジュアル ----
    {
      kind: "contact",
      section: "closing",
      heading: "contact の例\nクロージングの見出しを 2 行まで",
      lead: "lead は左側のリード文。\n呼びかけや締めのメッセージを\n3〜4 行で書きます。",
      contact: {
        rows: [
          { label: "Mail:", value: "example@example.com" },
          { label: "Web:", value: "https://example.com" },
        ],
        qr: { label: "QR コード" },
      },
      image: { label: "メインビジュアル" },
      footer: "footer は下部の帯。省略も可能です。",
    },
  ],
};
