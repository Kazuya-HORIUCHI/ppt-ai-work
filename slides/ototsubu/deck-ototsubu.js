// deck-ototsubu.js — 「おとつぶぴあの事業イメージ」の pastel テーマ再現 deck。
// 元 PDF (270717) の全 22 ページを pastel テーマの kind 語彙で再構成したもの。
// 画像スロットはすべて src 未指定（破線プレースホルダ表示）。画像を用意したら
// 各 image: { label } に src: "assets/..." を追加すれば埋め込まれる。
//
// 実行: node themes/pastel/renderer.js deck-ototsubu.js out-ototsubu.pptx

module.exports = {
  meta: {
    title: "おとつぶぴあの事業イメージ",
    heading: "おとつぶぴあの事業イメージ",
    subtitle: "亀田 明里",
  },
  sections: {
    motive:  "Part 1 創業動機と課題",
    vision:  "Part 2 ビジョン",
    roadmap: "Part 3 ロードマップ",
    plan:    "Part 4 初期事業プラン",
    join:    "Part 5 一緒に創る仲間へ",
  },
  slides: [
    // ---- p1 表紙 ----
    { kind: "title-slide" },

    // ---- p2 章扉 ----
    {
      kind: "section-divider",
      label: "Part 1",
      title: "創業動機と課題",
      subtitle: "なぜこの活動を始めるのか",
    },

    // ---- p3 創業の原点（4 カード + 矢印） ----
    {
      kind: "image-cards",
      section: "motive",
      title: "創業の原点",
      message: "「基礎で苦しむ子どもを減らしたい」",
      flow: true,
      cards: [
        {
          title: "ピアノとの出会い",
          image: { label: "ピアノを弾く女の子" },
          body: "「ピアノが好き」\n「弾けるようになりたい」\n\n純粋な気持ちで\nピアノを始める",
        },
        {
          title: "憧れの先生との出会い",
          image: { label: "先生と連弾する子ども" },
          body: "魅力的な先生に出会い、\nピアノ講師を目指す\nきっかけになる",
        },
        {
          title: "専門的に学ぶ中での\n挫折体験",
          image: { label: "楽譜に悩む学生" },
          body: ["譜読み", "基礎的な奏法", "身体の使い方"],
          conclusion: "一から学び直す苦しさ",
        },
        {
          title: "生徒たちへの想い",
          image: { label: "胸に手を当てる講師" },
          body: "同じように基礎で苦しまないでほしい\n\n楽譜を読むことや\n音楽のしくみを\n得意にしてあげたい",
        },
      ],
    },

    // ---- p4 感じている課題感（3 カード + 結論 + まとめ帯） ----
    {
      kind: "image-cards",
      section: "motive",
      title: "感じている課題感",
      cards: [
        {
          title: "子どもたちのつまずき",
          image: { label: "楽譜に戸惑う子ども" },
          body: ["譜読みが苦手", "基礎的な技術が身につかない", "練習が続かない"],
          conclusion: "楽しさを感じる前に挫折してしまう",
        },
        {
          title: "家庭や講師側の悩み",
          image: { label: "悩む保護者" },
          body: [
            "家庭でのサポート方法が分からない",
            "講師の指導力に差がある",
            "体系的に学ぶ機会が少ない",
          ],
          conclusion: "十分なサポートができない",
        },
        {
          title: "クラシック音楽の敷居の高さ",
          image: { label: "グランドピアノと扉" },
          body: [
            "「難しい」「お金がかかる」",
            "「敷居が高い」というイメージ",
            "身近に触れる入口が少ない",
          ],
          conclusion: "音楽が一部の人のものに",
          variant: "green",
        },
      ],
      summary: {
        text: "子ども・家庭・講師 それぞれに課題があり、\n音楽の基礎教育を体系的に受けられる環境が不足しています。",
        image: { label: "人々のアイコン" },
      },
    },

    // ---- p5 実現したい未来（Before / After） ----
    {
      kind: "before-after",
      section: "motive",
      title: "実現したい未来",
      message: "すべての子どもが、音楽を一生の楽しみにできる世界へ",
      before: {
        title: "Before",
        items: [
          { text: "先生の指導力に差がある", image: { label: "先生" } },
          { text: "家庭環境によってサポートに差がある", image: { label: "家" } },
          { text: "譜読みや基礎でつまずく", image: { label: "子ども" } },
          { text: "楽しさを知る前にやめてしまう", image: { label: "悲しい顔" }, emphasis: true },
        ],
      },
      after: {
        title: "After",
        items: [
          { text: "家庭でも無理なく学べる仕組み", image: { label: "家" } },
          { text: "わかりやすく体系的な教材とサポート", image: { label: "タブレット" } },
          { text: "譜読みが得意になり、自信がつく", image: { label: "子ども" } },
          { text: "音楽を楽しみ、長く続けられる！", image: { label: "ピアノ" }, emphasis: true },
        ],
      },
      aside: {
        image: { label: "ピアノを楽しむ女の子" },
        caption: "音楽が、もっと身近で、\nもっと楽しいものに。\nその未来をつくります。",
      },
    },

    // ---- p6 章扉 ----
    {
      kind: "section-divider",
      label: "Part 2",
      title: "ビジョン",
      subtitle: "おとつぶぴあのの目指す未来",
    },

    // ---- p7 ビジョン（リード + 円形画像 + 特徴帯） ----
    {
      kind: "lead-visual",
      section: "vision",
      title: "おとつぶぴあののビジョン",
      lead: "音楽をもっと身近に、もっと楽しく。\n子ども・家庭・指導者が同じ方向を向いて、\n笑顔で音楽にふれる未来をつくります。",
      image: { label: "笑顔の家族" },
      features: [
        { image: { label: "ピアノを弾く子ども" }, caption: "子どもが音楽を\n好きになる" },
        { image: { label: "安心する両親" }, caption: "家庭が安心して\n支えられる" },
        { image: { label: "指揮する先生" }, caption: "良い指導者が\n育つ" },
        { image: { label: "音楽ホール" }, caption: "クラシック音楽の\n裾野を広げる" },
      ],
    },

    // ---- p8 教材の特徴（4 カード + まとめ帯） ----
    {
      kind: "image-cards",
      section: "vision",
      title: "おとつぶぴあのの教材の特徴",
      message: "3〜5歳の子どもと保護者に向けて、\n音楽の基礎を楽しく体系的に学べる教材を提供します。",
      cards: [
        {
          title: "遊び",
          image: { label: "積み木で遊ぶ子ども" },
          body: "楽しく学べる\n工夫がいっぱい",
        },
        {
          title: "歌・音源",
          image: { label: "歌う女の子" },
          body: "歌って感じて、\n音楽を好きになる",
        },
        {
          title: "カード・物語",
          image: { label: "音符カードと絵本" },
          body: "理解が深まり、\n想像力も育つ",
        },
        {
          title: "動画",
          image: { label: "タブレットの再生画面" },
          body: "視覚的に学び、\n家庭でも続けやすい",
        },
      ],
      summary: {
        text: "「音楽が分かるから、もっと楽しい」\n「自分で読めるから、もっと弾いてみたくなる」体験を生み出します。",
        image: { label: "ハートのアイコン" },
      },
    },

    // ---- p9 課題と解決方法（左右マッピング） ----
    {
      kind: "mapping-rows",
      section: "vision",
      title: "課題と解決方法",
      left: {
        title: "いま起きている課題",
        rows: [
          {
            title: "社会の課題",
            body: ["人口減少・経済的不安", "ピアノ離れ・習い事への偏り", "音楽教育の裾野が細くなる"],
            image: { label: "街と人" },
            variant: "pink",
          },
          {
            title: "講師の課題",
            body: ["導入期指導・保護者対応が未体系", "レッスン時間も足りない"],
            image: { label: "先生" },
            variant: "yellow",
          },
          {
            title: "家庭の課題",
            body: ["何をどう練習すればよいか不明", "声かけや支え方に迷う"],
            image: { label: "親子" },
            variant: "green",
          },
          {
            title: "子どもの課題",
            body: ["譜読みや練習でつまずく", "楽しむ前に挫折意識を持つ"],
            image: { label: "悩む子ども" },
            variant: "blue",
          },
        ],
      },
      right: {
        title: "おとつぶぴあのでの解決方法",
        rows: [
          {
            title: "まずは講師向け",
            body: "導入期の指導法を体系化\n教材・使い方・相談サポート",
            image: { label: "教える先生" },
          },
          {
            title: "家庭向けサポート",
            body: "練習ガイド・保護者への伝え方\n声かけ例を整える",
            image: { label: "練習ガイドを持つ人" },
          },
          {
            title: "親子向け教材・音源",
            body: "音楽あそび・歌・絵本・楽典教材\n0歳から続けるクラシック",
            image: { label: "くまと絵本と CD" },
          },
          {
            title: "体験の場へ広げる",
            body: "親子コンサート・地域イベント\n音楽ミュージアムへ",
            image: { label: "小さなコンサート" },
          },
        ],
      },
    },

    // ---- p10 目指す未来（円形チェーン + まとめ帯） ----
    {
      kind: "circle-chain",
      section: "vision",
      title: "目指す未来",
      lead: "教材から始まり、学びの輪を広げていきます。\n子ども・家庭・指導者がつながり、音楽を楽しむ環境をつくります。",
      nodes: [
        { label: "教材", image: { label: "カード" } },
        { label: "オンライン\nレッスン", image: { label: "PC レッスン" } },
        { label: "親向け\nサポート", image: { label: "保護者" } },
        { label: "絵本・\nキャラクター", image: { label: "絵本とくま" } },
        { label: "音源", image: { label: "CD" } },
        { label: "親子\nコンサート", image: { label: "舞台" } },
        { label: "講師育成", image: { label: "先生" } },
      ],
      summary: {
        text: "音楽を楽しむ入口を広げ、学ぶ人・教える人・聴く人が育つ循環をつくる、\nクラシック音楽を、もっと身近で楽しい文化へ。",
        image: { label: "家族" },
      },
    },

    // ---- p11 章扉 ----
    {
      kind: "section-divider",
      label: "Part 3",
      title: "ロードマップ",
      subtitle: "1年間の計画",
    },

    // ---- p12 ロードマップ（タイムライン） ----
    {
      kind: "timeline",
      section: "roadmap",
      header: "bar",
      title: "1年間のステップアップロードマップ",
      steps: [
        {
          label: "新米ピアノ講師サポート",
          description: "新米ピアノ講師の「わからない」「不安」にダイレクトに応えます",
          image: { label: "PC で学ぶ講師" },
        },
        {
          label: "講師コミュニティ",
          description: "同じ志を持つ仲間が集まる場所をつくります",
          image: { label: "会話する二人" },
        },
        {
          label: "保護者サポート",
          description: "講師サポートを土台に、ピアノを習う子どもを持つ保護者のサポートも開始します",
          image: { label: "読み聞かせる親子" },
        },
        {
          label: "教材開発",
          description: "サポート事業やその後の教材配信事業で使用するツールを作成します",
          image: { label: "PC と楽譜" },
        },
      ],
    },

    // ---- p13 章扉 ----
    {
      kind: "section-divider",
      label: "Part 4",
      title: "初期事業プラン",
      subtitle: "ビジョン実現のための第一歩",
    },

    // ---- p14 3種類の初期事業案（3 カード + 強調帯） ----
    {
      kind: "image-cards",
      section: "plan",
      header: "bar",
      title: "3種類の初期事業案",
      cards: [
        {
          title: "講師の育成",
          image: { label: "指差しする講師" },
          body: "新米ピアノ講師を中心に\n「今困っていること」への\n直接的な解決アプローチを行います",
          variant: "green",
        },
        {
          title: "保護者へのサポート",
          image: { label: "ひらめく保護者" },
          body: "子どもが家庭でも十分にピアノ練習を\nできるようにするために、保護者の\n関わり方をリアルタイムでアドバイスします",
          variant: "yellow",
        },
        {
          title: "親子で楽しむ音楽",
          image: { label: "遊ぶ親子" },
          body: "毎日の遊びの中で楽しく\n音楽に触れる機会を\n作っていきます",
          variant: "pink",
        },
      ],
      summary: {
        text: "「子ども」「音楽の教育の体系化」を基軸にサービスを提供したい",
        image: { label: "絵本を読む家族" },
      },
    },

    // ---- p15 3種類の初期事業案_概要（比較マトリクス） ----
    {
      kind: "matrix-table",
      section: "plan",
      header: "bar",
      title: "3種類の初期事業案_概要",
      columns: [
        { title: "講師育成講座を開講" },
        { title: "親向け支援サポート", variant: "green" },
        { title: "動画配信教材", variant: "yellow" },
      ],
      rows: [
        {
          label: "ターゲット",
          icon: { label: "的" },
          cells: [
            { text: "子どもへの教え方に不安がある新米ピアノ講師", image: { label: "講師" } },
            { text: "ピアノを習い始めてつまずきがある子どもの親", image: { label: "親子" } },
            { text: "教育意識が高く音楽基礎に触れさせたい親", image: { label: "親" } },
          ],
        },
        {
          label: "商品概要",
          icon: { label: "箱" },
          cells: [
            {
              items: ["オンライン相談", "チャット相談サポート", "メンバー限定の交流ラウンジ", "動画講座", "オリジナル教材"],
              image: { label: "画面" },
            },
            {
              items: ["動画配信", "教材", "グループコンサル", "相談チャット", "動画レッスン"],
              image: { label: "スマホ" },
            },
            {
              items: ["動画配信", "教材"],
              image: { label: "本" },
            },
          ],
        },
        {
          label: "価格イメージ",
          icon: { label: "¥" },
          cells: ["高単価", "中〜高単価", "低〜中単価"],
        },
        {
          label: "販売数",
          icon: { label: "グラフ" },
          cells: ["少量", "少〜中量", "中〜多量"],
        },
        {
          label: "サブスク/買い切り",
          icon: { label: "カート" },
          cells: ["買い切り\nラウンジのみサブスク", "サブスク", "サブスク／買い切り"],
        },
        {
          label: "主な競合",
          icon: { label: "人々" },
          cells: ["講師育成グループ", "音楽教室", "音楽教室、知育サービス"],
        },
        {
          label: "課題",
          icon: { label: "!" },
          cells: ["ラウンジの維持は工数あり", "顧客ニーズに応えきれない可能性がある", "競合が多すぎる"],
        },
      ],
    },

    // ---- p16 プラン案_1（spec-rows） ----
    {
      kind: "spec-rows",
      section: "plan",
      header: "bar",
      title: "プラン案_1 講師育成講座を開講",
      rows: [
        {
          label: "ターゲット",
          icon: { label: "的" },
          text: "子どもへの教え方に不安があるピアノ講師\n教材を自分で用意する余裕がない講師",
          image: { label: "PC 前の講師" },
        },
        {
          label: "商品概要",
          icon: { label: "箱" },
          text: ["オンライン相談", "チャット相談サポート", "メンバー限定の交流ラウンジ", "動画講座", "オリジナル教材"],
          image: { label: "オンライン講座" },
        },
        { label: "価格", icon: { label: "¥" }, text: "高単価　11,000円〜198,000円", image: { label: "がま口" } },
        { label: "販売数", icon: { label: "グラフ" }, text: "少量", image: { label: "人々" } },
        { label: "サブスク/買い切り", icon: { label: "カート" }, text: "買い切り。ラウンジのみサブスク", image: { label: "カレンダー" } },
        { label: "販促方法", icon: { label: "メガホン" }, text: "知り合いでテスト導入→教室に営業、SNS認知拡大", image: { label: "SNS" } },
        { label: "主な競合", icon: { label: "人々" }, text: "講師育成グループ", image: { label: "学校" } },
        { label: "課題", icon: { label: "!" }, text: "ラウンジの維持は工数あり", image: { label: "汗をかく人" } },
      ],
    },

    // ---- p17 プラン案_1 商品化イメージ（step-matrix） ----
    {
      kind: "step-matrix",
      section: "plan",
      header: "bar",
      title: "プラン案_1 講師育成講座を開講_商品化イメージ",
      columns: ["料金", "内容", "目的"],
      steps: [
        {
          label: "無料モニター",
          sublabel: "まずは体験・相談",
          cells: ["¥0", ["60分相談", "課題整理", "次回レッスンで試す提案"], ["需要確認", "課題収集", "実績作り"]],
        },
        {
          label: "単発診断コンサル",
          sublabel: "課題を明確にする",
          variant: "green",
          cells: ["¥11,000〜\n¥22,000", ["事前アンケート", "60〜90分相談", "レッスン処方箋作成"], ["初期収益化"]],
        },
        {
          label: "1ヶ月伴奏サポート",
          sublabel: "伴走して実践サポート",
          variant: "yellow",
          cells: ["¥33,000〜\n¥55,000", ["初回相談・フォロー相談", "家庭練習設計", "保護者説明文作成"], ["成果事例の獲得"]],
        },
        {
          label: "動画講座付きプログラム",
          sublabel: "学びを深めて効率化",
          variant: "purple",
          cells: ["¥98,000〜\n¥148,000", ["動画講座・個別診断", "月1回相談", "実践フィードバック", "チャットサポート"], ["時間効率化と高単価化"]],
        },
        {
          label: "本格講座・継続講座",
          sublabel: "体系化された学びへ",
          variant: "pink",
          cells: ["¥198,000\n前後", ["体系化された動画講座", "教材テンプレート", "家庭練習ワーク", "個別診断・実践添削"], ["講師向け主力商品の確立"]],
        },
      ],
      note: "小さく始めて、信頼と実績を積み上げながら、体系化された主力商品へとつなげていきます。",
    },

    // ---- p18 プラン案_2（spec-rows） ----
    {
      kind: "spec-rows",
      section: "plan",
      header: "bar",
      title: "プラン案_2 親向け支援サポート",
      rows: [
        {
          label: "ターゲット",
          icon: { label: "親子" },
          text: "ピアノを習い始めたものの、楽譜を読むことや家庭練習でつまずきがある子どもの保護者",
          image: { label: "音符" },
        },
        {
          label: "商品概要",
          icon: { label: "本" },
          text: [
            "松：竹の内容＋動画添削／動画フィードバック",
            "竹：梅の内容＋月1回グループ相談・相談チャット",
            "梅：教材一式・解説動画・3か月の練習進行表",
          ],
          image: { label: "オンライン相談" },
        },
        {
          label: "価格",
          icon: { label: "¥" },
          text: "中〜高単価　松：98,000円〜148,000円　竹：49,800円〜69,800円　梅：19,800円〜29,800円",
        },
        { label: "販売数", icon: { label: "グラフ" }, text: "少〜中量", image: { label: "人々" } },
        { label: "サブスク/買い切り", icon: { label: "カート" }, text: "3か月完結型の買い切り", image: { label: "カレンダー" } },
        {
          label: "販促方法",
          icon: { label: "メガホン" },
          text: "SNSで認知拡大／LINE登録から無料チェックシート・個別相談へ誘導\n既存の知人・生徒保護者・ピアノ講師経由でモニター募集",
          image: { label: "スマホ" },
        },
        {
          label: "主な競合",
          icon: { label: "王冠" },
          text: "音楽教室、オンラインピアノレッスン、動画添削レッスン、家庭学習教材",
          image: { label: "家と音符" },
        },
        {
          label: "課題",
          icon: { label: "!" },
          text: "通常のレッスンを完全に代替する商品ではないため、既存のピアノレッスンと併用する前提で設計する必要がある。動画添削や相談チャットは個別対応の工数が大きいため、松プランの人数制限や対応範囲を明確にする必要がある",
          image: { label: "悩む人" },
        },
      ],
    },

    // ---- p19 プラン案_3（spec-rows） ----
    {
      kind: "spec-rows",
      section: "plan",
      header: "bar",
      title: "プラン案_3 動画配信教材",
      rows: [
        {
          label: "ターゲット",
          icon: { label: "的" },
          text: "教育意識が高く音楽基礎に触れさせたい親",
          image: { label: "抱っこする親" },
        },
        {
          label: "商品概要",
          icon: { label: "本" },
          text: [
            "松：教材・使い方ガイド・解説動画・音源教材",
            "竹：教材・使い方ガイド・解説動画",
            "梅：教材・使い方ガイド",
          ],
          image: { label: "動画教材" },
        },
        {
          label: "価格",
          icon: { label: "¥" },
          text: "低〜中単価　松：39,800円〜　竹：12,800円〜　梅：1,980円〜4,980円",
          image: { label: "財布" },
        },
        { label: "販売数", icon: { label: "グラフ" }, text: "中〜多量", image: { label: "人々" } },
        {
          label: "サブスク/買い切り",
          icon: { label: "カート" },
          text: "初期導入時は買い切り（3ヶ月分の教材パックとして販売）",
          image: { label: "カレンダー" },
        },
        { label: "販促方法", icon: { label: "メガホン" }, text: "SNSで認知拡大", image: { label: "スマホ" } },
        { label: "主な競合", icon: { label: "王冠" }, text: "音楽教室、知育サービス", image: { label: "学校" } },
        {
          label: "課題",
          icon: { label: "!" },
          text: "競合が多い、低単価になりやすい、SNSやLINEなどの集客導線が必要\n制作コストが大きくなりやすい",
          image: { label: "悩む人" },
        },
      ],
    },

    // ---- p20 章扉 ----
    {
      kind: "section-divider",
      label: "Part 5",
      title: "一緒に創る仲間へ",
      subtitle: "音楽教育の未来をつくる一員になりませんか",
    },

    // ---- p21 仲間募集（ハブ + スポーク） ----
    {
      kind: "hub-spokes",
      section: "join",
      title: "音楽教育の未来をつくる\n仲間をもとめています",
      lead: "子ども・家庭・指導者がともに育つ、新しい音楽教育を一緒につくりませんか。",
      hub: {
        title: "おとつぶぴあの",
        subtitle: "子ども・家庭・講師をつなぐ\n新しい音楽教育を、共に。",
        image: { label: "家族のイラスト" },
      },
      spokes: [
        {
          title: "ベテラン講師",
          description: "豊富な経験と知識で指導の質を高める",
          image: { label: "ベテラン講師" },
          variant: "blue",
        },
        {
          title: "若手講師",
          description: "新しい視点やアイデアで未来を切り拓く",
          image: { label: "若手講師" },
          variant: "green",
        },
        {
          title: "デザイナー",
          description: "魅力的な教材やビジュアルで学びを楽しく彩る",
          image: { label: "パレット" },
          variant: "yellow",
        },
        {
          title: "保護者",
          description: "家庭でのサポートやリアルな声で共に育てる",
          image: { label: "家族" },
          variant: "pink",
        },
        {
          title: "ライター",
          description: "想いや価値を言葉にして多くの人につなげる",
          image: { label: "ペンとメモ" },
          variant: "pink",
        },
        {
          title: "幼児教育経験者",
          description: "子どもの発達を理解し学びの土台をつくる",
          image: { label: "教育者" },
          variant: "green",
        },
        {
          title: "システム開発",
          description: "使いやすい仕組みで学びを届けやすくする",
          image: { label: "ノート PC" },
          variant: "purple",
        },
      ],
      footer: "一人では作れない未来だから。子どもたちが音楽をもっと好きになる世界を、一緒につくりませんか。",
    },

    // ---- p22 コンタクト ----
    {
      kind: "contact",
      section: "join",
      heading: "音楽が彩る豊かな未来\nただの習い事を超えた、一生の財産",
      lead: "音楽教育は、\n一人の先生だけでは変えられない。\nだからこそ、\n一緒に未来をつくる仲間を募集しています。",
      contact: {
        rows: [
          { label: "Mail:", value: "ototsubuchannel@gmail.com" },
          { label: "公式LINE:", value: "" },
        ],
        qr: { label: "LINE QR コード" },
      },
      image: { label: "ピアノを弾く女の子（メインビジュアル）" },
      footer: "一人ではつくれない未来だから。子どもたちが音楽をもっと好きになる世界を、一緒につくりませんか。",
    },
  ],
};
