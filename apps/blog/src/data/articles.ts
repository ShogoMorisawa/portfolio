export type ArticleCategory = 'tech' | 'psychology'

export type Article = {
  slug: string
  title: string
  category: ArticleCategory
  description: string
  publishedAt: string
  readTime: string
  eyebrow: string
  body: string[]
}

export const articleCategories: { value: ArticleCategory; label: string }[] = [
  { value: 'tech', label: 'TECH' },
  { value: 'psychology', label: 'PSYCHOLOGY' },
]

export const articles: Article[] = [
  {
    slug: 'cursor-moves-before-thought',
    title: 'カーソルが思考より先に動く瞬間',
    category: 'tech',
    description:
      'UI の反応速度を削るのではなく、意図した遅延をデザインに変えるための観察メモ。',
    publishedAt: '2026.04.18',
    readTime: '6 min read',
    eyebrow: 'interaction notes',
    body: [
      '速さは正義、という前提で作ると画面はたしかに快適になる。でも、全部が即応しすぎると、そこに人格は宿りにくい。わずかな遅れがあることで、ユーザーは「反応」ではなく「気配」を感じる。',
      'とくに視線や呼吸のような生き物の動きは、ボタンのクリックレスポンスとは違う。目的地に対して即座に一致するのではなく、少し遅れて、少し迷いながら、でも確実に追いつく。その差分に感情がある。',
      '最近は requestAnimationFrame と軽い easing を使って、反応速度ではなく質感を設計することが増えた。最適化は無機質に削るためではなく、意図した気持ち悪さを滑らかに成立させるために使うほうが面白い。',
    ],
  },
  {
    slug: 'tongue-header-patterns',
    title: 'ベロヘッダーはナビゲーションになれるか',
    category: 'tech',
    description:
      'ヘッダーを装飾ではなく導線として使うとき、どこまで遊んでよくて、どこから読みづらくなるのか。',
    publishedAt: '2026.04.16',
    readTime: '4 min read',
    eyebrow: 'layout experiment',
    body: [
      'ヘッダーを平たい長方形で終わらせるのはもったいない。画面の最初に見える塊だからこそ、ブランドの世界観をいちばん濃く注ぎ込める。',
      'ただし、遊ぶなら導線はむしろ明快でないと厳しい。今回のベロヘッダーは、見た目は妙でも、リンクの位置とラベルはなるべくストレートにしている。気持ち悪さと読みやすさは両立できる。',
      '一定時間で引っ込む挙動も、驚かせるためだけではない。画面を読む時間帯には情報の邪魔をせず、動き出した瞬間にまた存在感を取り戻す。その切り替えが、このサイトの呼吸になっている。',
    ],
  },
  {
    slug: 'why-eyes-feel-alive',
    title: '目が合うだけで生き物に見える理由',
    category: 'psychology',
    description:
      '視線追従とまばたきだけで、なぜユーザーはそこに人格を感じるのかを整理したメモ。',
    publishedAt: '2026.04.14',
    readTime: '5 min read',
    eyebrow: 'perception memo',
    body: [
      '人は顔を探す。雲の形にもコンセントにも顔を見つけてしまうくらい、顔らしさへの感度が高い。そこへ視線移動とまばたきが入ると、単なる図形は一気に主体へ変わる。',
      '面白いのは、完璧にリアルである必要がないことだ。むしろ少し雑で、少しデフォルメされているほうが、脳が勝手に補完して愛着や不気味さを増幅してくれる。',
      'だからこそ、記事一覧や記事本文のような静的な情報面にも、顔のモチーフを被せる価値がある。コンテンツを読む前に、まずそのサイトに誰が住んでいるかを伝えられる。',
    ],
  },
  {
    slug: 'when-we-keep-scrolling',
    title: 'スクロールをやめられない心理の形',
    category: 'psychology',
    description:
      '終わりが見えない縦方向の UI が、なぜ安心と不安を同時に生むのかについて。',
    publishedAt: '2026.04.11',
    readTime: '7 min read',
    eyebrow: 'behavior sketch',
    body: [
      '縦に伸びる面は、読書に近い安心感を持っている。一方で終わりが見えないと、どこまで連れていかれるのか分からない軽い不安も生まれる。その二重性は、モンスターのベロのようなモチーフと相性がいい。',
      '今回の記事画面では、口から始まったベロが画面外まで落ち続けているように見せたい。情報の容れ物であると同時に、読者を飲み込む導線にも見えるからだ。',
      'ユーザーは読み進めながら、情報を摂取しているのか、こちらが食べられているのか、少しだけ分からなくなる。その曖昧さがサイトの記憶に残る。',
    ],
  },
]

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug)
}
