/**
 * Boxセクション用データ: スキル一覧・アイテム一覧
 * メニュー項目の追加がしやすいように配列で定義
 */

export type BoxMenuEntry = {
  id: "skills" | "items";
  label: string;
};

/** メインメニュー（左縦並び）。後から項目を追加しやすい */
export const BOX_MENU_ENTRIES: BoxMenuEntry[] = [
  { id: "items", label: "アイテム一覧" },
  { id: "skills", label: "スキル一覧" },
];

export type SkillEntry = {
  id: string;
  name: string;
  rare: number;
  level: number; // 1〜6（斬れ味）
  /** 攻撃力（開始日・取得日を年月日でカンマ区切り。例: 2025/2/24 → "20,250,224"。未定は "???,???,???" */
  attack: string;
  description: string;
  /** アイコン画像URL（未設定時は名前の頭文字表示） */
  url?: string;
};

export const SKILL_ENTRIES: SkillEntry[] = [
  {
    id: "html",
    name: "HTML",
    rare: 1,
    level: 3,
    attack: "20,220,621",
    description: "これからはプログラミングが大事と聞いてProgateで始めました。",
    url: "/skills/html.png",
  },
  {
    id: "css",
    name: "CSS",
    rare: 1,
    level: 3,
    attack: "20,220,621",
    description: "これからはプログラミングが大事と聞いてProgateで始めました。",
    url: "/skills/css.png",
  },
  {
    id: "boki-3",
    name: "簿記3級",
    rare: 2,
    level: 2,
    attack: "20,230,618", // 2023年6月18日
    description: "これからはお金の勉強が大事と聞いてやってみました。",
    url: "/skills/boki3.png",
  },
  {
    id: "javascript",
    name: "JavaScript",
    rare: 2,
    level: 3,
    attack: "20,240,701",
    description:
      "Udemyで学習。自分が描いた絵を飾るための額縁サイトを作りたくて始めました。",
    url: "/skills/JavaScript.png",
  },
  {
    id: "ruby",
    name: "Ruby",
    rare: 2,
    level: 1,
    attack: "20,250,301",
    description:
      "Railsからいきなり使い始めたのであまり詳しくないです。",
    url: "/skills/ruby.png",
  },
  {
    id: "react",
    name: "React",
    rare: 4,
    level: 3,
    attack: "20,250,301",
    description:
      "アプリ一個作れば就職できると思い、『Duel Practice App』を作るため勉強を始めました。",
    url: "/skills/react.png",
  },
  {
    id: "rails",
    name: "Ruby on Rails",
    rare: 4,
    level: 1,
    attack: "20,250,301",
    description:
      "アプリ一個作れば就職できると思い、『Duel Practice App』を作るため勉強を始めました。",
    url: "/skills/rails.png",
  },
  {
    id: "toeic",
    name: "TOEIC 795",
    rare: 4,
    level: 2,
    attack: "20,250,420", // 2025年4月20日
    description:
      "高校時代英語が得意だったのでその残滓。今はゴミです。いつか真剣に勉強し直したいです。",
    url: "/skills/toeic.png",
  },
  {
    id: "typescript",
    name: "TypeScript",
    rare: 3,
    level: 3,
    attack: "20,250,630",
    description:
      "JavaScriptから成長しました。型って難しくてよくわからなかったけど、今は楽しくて好きです。",
    url: "/skills/TypeScript.png",
  },
  {
    id: "nextjs",
    name: "Next.js",
    rare: 4,
    level: 3,
    attack: "20,250,630", // 2025年6月30日
    description:
      "Reactの続きとして勉強しました。このポートフォリオサイトもこれで作っています。",
    url: "/skills/nextjs.png",
  },
  {
    id: "aws-saa",
    name: "AWS SAA",
    rare: 5,
    level: 2,
    attack: "20,250,730", // 2025年7月30日
    description:
      "最終面接に落ちた焦りで3日間で詰め込み、試験は徹夜で受験しました。猛烈な吐き気の中で手にした、もう二度と再現不可能な奇跡。",
    url: "/skills/saa.png",
  },
  {
    id: "php",
    name: "PHP",
    rare: 2,
    level: 4,
    attack: "20,251,009",
    description:
      "内定をいただいた会社でPHPを使用していると伺ったので勉強しました。インターンで修行中です。",
    url: "/skills/php.png",
  },
  {
    id: "laravel",
    name: "Laravel",
    rare: 4,
    level: 3,
    attack: "20,251,029",
    description:
      "内定をいただいた会社でPHPを使用していると伺ったので勉強しました。『OoX』を作るのに使いました。",
    url: "/skills/laravel.png",
  },
  {
    id: "sql",
    name: "SQL",
    rare: 3,
    level: 2,
    attack: "20,260,116",
    description:
      "ちゃんと勉強したことがなくてインターンでその重要性を痛感しました。近いうちに真剣に勉強したいです。",
    url: "/skills/sql.png",
  },
];

/** 1スロット = 1アイテム。100マス目までバクオンソー、101〜113が愛用品 */
export type ItemEntry = {
  id: string;
  name: string;
  description: string;
  /** 所持数（フッターの「x 100」表示用） */
  quantity: number;
  iconPath?: string;
};

const BAKUN_SOU_DESCRIPTION =
  "「こいつ強すぎ！絶対値上がりするやろ」と思って一枚1200円で100枚買ったカード。合計130,000円。今は4枚セットで300円。";

/** バクオンソー × 100（100要素をDOMに描画するため、実際に100個用意） */
const BAKUN_SOU_ENTRY: ItemEntry = {
  id: "bakun-sou",
  name: "頂上混成 BAKUONSOOO8th",
  description: BAKUN_SOU_DESCRIPTION,
  quantity: 100,
  iconPath: "/items/bakuonso.png",
};

const BAKUN_SOU_SLOTS: ItemEntry[] = Array.from({ length: 100 }, () => ({
  ...BAKUN_SOU_ENTRY,
}));

const LIPTON_ENTRY: ItemEntry = {
  id: "lipton-lemon",
  name: "リプトンのレモンティー",
  description: "小学生の頃から一生飲んでる。血液多分この色。",
  quantity: 12,
  iconPath: "/items/lipton.png",
};

const LIPTON_SLOTS: ItemEntry[] = Array.from({ length: 12 }, () => ({
  ...LIPTON_ENTRY,
}));

const LOVED_ITEMS: ItemEntry[] = [
  {
    id: "buta-kun",
    name: "ぶたくん",
    description: "幼い頃どこ行くにも連れていったぬいぐるみ。",
    quantity: 1,
    iconPath: "/items/butakun.png",
  },
  ...LIPTON_SLOTS,
];

function shuffleWithSeed<T>(source: readonly T[], initialSeed: number): T[] {
  const result = [...source];
  let seed = initialSeed >>> 0;
  const nextRandom = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 全113スロットを固定シードで一度だけシャッフルして配置 */
export const ITEM_ENTRIES: ItemEntry[] = shuffleWithSeed(
  [...BAKUN_SOU_SLOTS, ...LOVED_ITEMS],
  20260220,
);

/** 1ページあたりのスロット数（10×10固定） */
export const SLOTS_PER_PAGE = 100;

/** アイテム総数に必要なページ数 */
export const ITEM_PAGE_COUNT = Math.ceil(ITEM_ENTRIES.length / SLOTS_PER_PAGE);
