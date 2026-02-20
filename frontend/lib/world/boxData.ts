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

/** スキル（装備）のレア度 */
export type SkillRarity = "common" | "rare" | "sr" | "ssr";

export type SkillEntry = {
  id: string;
  name: string;
  /** じゅくれんど（斬れ味ゲージのパロディ）1〜5 */
  level: number;
  rarity: SkillRarity;
  description: string;
  /** アイコン画像パス（未設定時はプレースホルダー） */
  iconPath?: string;
};

export const SKILL_ENTRIES: SkillEntry[] = [
  {
    id: "php",
    name: "PHP",
    level: 4,
    rarity: "sr",
    description: "実務でLaravelを用いたWebアプリ開発。レガシーからモダンまで。",
    iconPath: undefined,
  },
  {
    id: "typescript",
    name: "TypeScript",
    level: 4,
    rarity: "sr",
    description: "フロント・バック両方で使用。型で安心。",
    iconPath: undefined,
  },
  {
    id: "react",
    name: "React",
    level: 4,
    rarity: "sr",
    description: "関数コンポーネント + Hooks。このポートフォリオもReact。",
    iconPath: undefined,
  },
  {
    id: "nextjs",
    name: "Next.js",
    level: 3,
    rarity: "rare",
    description: "App Router / RSC で制作経験あり。",
    iconPath: undefined,
  },
  {
    id: "laravel",
    name: "Laravel",
    level: 4,
    rarity: "sr",
    description: "業務システム・API開発で使用。",
    iconPath: undefined,
  },
  {
    id: "aws-saa",
    name: "AWS SAA",
    level: 3,
    rarity: "sr",
    description: "認定ソリューションアーキテクト – アソシエイト取得。",
    iconPath: undefined,
  },
  {
    id: "atcoder",
    name: "競技プログラミング（AtCoder緑）",
    level: 2,
    rarity: "rare",
    description: "緑コーダー。アルゴリズムとデータ構造の基礎。",
    iconPath: undefined,
  },
  {
    id: "fe",
    name: "基本情報技術者試験",
    level: 3,
    rarity: "rare",
    description: "国家資格取得。基礎的なITの知識。",
    iconPath: undefined,
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
