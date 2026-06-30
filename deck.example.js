// deck.example.js
// 全 12 kind を網羅したサンプル deck。renderer の動作確認と
// 各 kind のフィールド埋め方のリファレンスを兼ねる。
//
// 実行: node renderer.js deck.example.js deck.example.pptx

module.exports = {
  meta: {
    title: "サンプル資料 — 全 kind の表示確認",
    eyebrow: "テンプレ動作確認",
    heading: "全 kind デモ\n— スライド構築テンプレ集",
    subtitle: "title-slide / divider / bullets / table / 比較 / 図形系（flow・matrix・pyramid 等）",
    meta: "作成日: 2026-06-29",
  },

  // section キー → footer に表示するセクションラベル
  sections: {
    text: "テキスト系の例",
    compare: "比較系の例",
    diagram: "図形系の例",
  },

  slides: [
    // ============== 構造系 ==============
    { kind: "title-slide" },

    {
      kind: "section-divider",
      label: "Section 1",
      title: "テキスト系の kind",
    },

    // ============== テキスト系 ==============
    {
      kind: "bullets",
      section: "text",
      title: "kind: bullets ─ 全幅の箇条書き",
      message: "タイトル + サブメッセージ + 全幅の bullet list。最も基本的な構造のスライド。",
      items: [
        "1 行の主張をそのまま列挙する",
        "5〜7 項目程度に収めると視認性が高い",
        "1 項目が長文化したら別 kind（comparison-2 等）を検討",
        "items は順序に意味があってもなくても良い",
      ],
    },

    {
      kind: "key-takeaway",
      section: "text",
      title: "kind: key-takeaway ─ ひと言の結論",
      message: "資料中で「これだけ持ち帰って欲しい」要点を 1 つ強調する",
      takeaway: "オンライン化の本質は\n「タイムラグ不問」の認知操作トレーニングである",
      supporting: [
        "対面型実技指導は捨てる前提で設計する",
        "勝ち筋は「読譜 / ソルフェージュ」の体系化",
      ],
    },

    {
      kind: "data-table",
      section: "text",
      title: "kind: data-table ─ 表形式データ",
      message: "ヘッダ行 + 任意行数のデータ。下に注記（note）を任意で添えられる。",
      header: ["項目", "A 案", "B 案", "C 案"],
      rows: [
        ["初期コスト", "低", "中", "高"],
        ["スケール性", "中", "高", "高"],
        ["立ち上げ期間", "短", "中", "長"],
        ["回収期間", "1〜2 年", "2〜3 年", "3 年以上"],
      ],
      colW: [3.2, 2.8, 2.8, 3.23],
      rowH: 0.65,
      fontSize: 11,
      note: { text: "※ A〜C は本検討で並べた仮の選択肢。実数値は別資料を参照。" },
    },

    {
      kind: "section-divider",
      label: "Section 2",
      title: "比較系の kind",
    },

    // ============== 比較系 ==============
    {
      kind: "comparison-2",
      section: "compare",
      title: "kind: comparison-2 ─ 2 主体の対比（中立）",
      message:
        "左右に 2 つの主体を並べ、それぞれの特徴を箇条書きで提示する。左 6 件・右 4 件で件数差のあるケースを確認する。",
      left: {
        title: "案 A",
        body: [
          "強み: 既存資産を活かせる",
          "強み: 学習コストが低く既存メンバーで運用可能",
          "強み: 短期で結果を出しやすい",
          "弱み: 拡張性に難",
          "弱み: 横展開時に重複コードが発生しやすい",
          "適用: 既存基盤と密結合した機能の改修",
        ],
      },
      right: {
        title: "案 B",
        body: [
          "強み: アーキテクチャがクリーン",
          "弱み: 立ち上げ工数が大きい",
          "適用: 中長期の運用を前提とする場面",
          "適用: 複数チームで分担して開発する場面",
        ],
      },
    },

    {
      kind: "comparison-2",
      section: "compare",
      title: "kind: comparison-2 ─ ポジ／ネガで色分け",
      message:
        "variant に pos / neg / accent を指定するとカラーバリエーションが切り替わる。左 3 件・右 5 件で件数差のあるケースを確認する。",
      left: {
        title: "良い側面",
        body: [
          "学習コストが低い",
          "既存システムと衝突しない",
          "段階的に導入できる",
        ],
        variant: "pos",
      },
      right: {
        title: "懸念点",
        body: [
          "長期メンテで属人化しやすい",
          "他資料との表現が不揃いになる",
          "コーポレートテーマの刷新時に追従が困難",
          "レビュー時のチェックポイントが増える",
          "障害発生時の原因切り分けが難しくなる",
        ],
        variant: "neg",
      },
    },

    {
      kind: "trio",
      section: "compare",
      title: "kind: trio ─ 3 並列のカード（既定: 全カード gray）",
      message:
        "並列観点を 3 つ並べるのが本来の用途。variant 未指定で全カードが gray になる。",
      cards: [
        {
          title: "観点 1: 速度",
          body: ["立ち上げが早い", "市場投入が早い", "PoC で検証しやすい"],
        },
        {
          title: "観点 2: 品質",
          body: ["保守容易性が高い", "テストカバレッジ確保", "障害復旧時間が短い"],
        },
        {
          title: "観点 3: コスト",
          body: ["初期投資が小さい", "運用負荷が低い", "段階的な拡張が可能"],
        },
      ],
    },

    {
      kind: "trio",
      section: "compare",
      title: "kind: trio ─ 最右に強調を入れるパターン",
      message:
        "並列観点の先に結論を置くケース。最右カードにのみ variant を指定する（accent / pos / neg）。",
      cards: [
        {
          title: "問題 1: 立ち上がりの遅さ",
          body: ["設計フェーズが長引く", "意思決定のラグが大きい"],
        },
        {
          title: "問題 2: 属人化",
          body: ["特定メンバーへの依存", "知識共有が進まない"],
        },
        {
          title: "結論: 軽量プロセスで段階導入",
          body: [
            "MVP を 2 週間でリリース",
            "PR レビュー必須化で知識を共有",
            "ADR で意思決定の根拠を残す",
          ],
          variant: "accent",
        },
      ],
    },

    {
      kind: "section-divider",
      label: "Section 3",
      title: "図形系の kind",
    },

    // ============== 図形系 ==============
    {
      kind: "flow-diagram",
      section: "diagram",
      title: "kind: flow-diagram ─ 直列フロー",
      message: "A → B → C 形式の単線フロー。各ボックスにラベル + 短い説明を入れる。",
      steps: [
        { label: "情報源を読む", description: "元資料・ヒアリングメモ等の入力" },
        { label: "構成を考える", description: "AI が kind を選定" },
        { label: "deck.js 生成", description: "宣言データを書き出す" },
        { label: "pptx 出力", description: "renderer がレンダリング" },
      ],
    },

    {
      kind: "process-stages",
      section: "diagram",
      title: "kind: process-stages ─ 番号付き工程",
      message: "順序を明示したい工程列。番号バッジでステップ感を出す。",
      stages: [
        { label: "発散", description: "選択肢を広く列挙し、評価軸も洗い出す" },
        { label: "収束", description: "評価軸で絞り、トレードオフを文書化する" },
        { label: "検証", description: "PoC または利害関係者レビューで仮説を検証" },
        { label: "決定", description: "判断理由と未決事項を ADR として記録" },
      ],
    },

    {
      kind: "matrix-2x2",
      section: "diagram",
      title: "kind: matrix-2x2 ─ 4 象限分類",
      message: "2 軸で 4 象限に分類する。象限ごとに短い解釈を添える。",
      xAxis: { low: "影響度: 低", high: "影響度: 高" },
      yAxis: { high: "緊急度: 高", low: "緊急度: 低" },
      quadrants: {
        topLeft: {
          title: "今すぐ取り掛かる候補",
          body: "緊急度が高く影響度は限定的。短時間で片付ける。",
        },
        topRight: {
          title: "最優先",
          body: "緊急かつ影響大。リソースを集中投下する。",
        },
        bottomLeft: {
          title: "捨てる候補",
          body: "影響度も緊急度も低い。やらない判断をする。",
        },
        bottomRight: {
          title: "計画的に投資する",
          body: "影響が大きいが急がない。中長期の段取りに組み込む。",
        },
      },
    },

    {
      kind: "pyramid",
      section: "diagram",
      title: "kind: pyramid ─ 階層・優先度（layout: centered, 既定）",
      message: "上位ほど抽象度・優先度が高い概念に。各層に label と短い説明をインライン配置。",
      tiers: [
        { label: "Why", description: "解こうとしている問題と判断理由" },
        { label: "What", description: "実現する具体的な成果物と範囲" },
        { label: "How", description: "実行手段とそのスケジュール" },
      ],
    },

    {
      kind: "pyramid",
      section: "diagram",
      title: "kind: pyramid ─ 階層・優先度（layout: side）",
      message: "ピラミッドを左寄せし、説明文を右側に並べる構成。長めの説明文に向く。",
      layout: "side",
      tiers: [
        { label: "Why", description: "解こうとしている問題と判断理由。プロジェクトの存在意義に直結する。" },
        { label: "What", description: "実現する具体的な成果物と範囲。Why に従属して定義される。" },
        { label: "How", description: "実行手段とそのスケジュール。チームの能力・期間制約を踏まえる。" },
      ],
    },
  ],
};
