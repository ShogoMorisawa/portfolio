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
  iconType: string; // アイコンの出し分け用（仮）
};

export const SKILL_ENTRIES: SkillEntry[] = [
  {
    id: "html-css",
    name: "HTML / CSS",
    rare: 1,
    level: 5,
    attack: "???,???,???",
    description:
      "すべての始まりとなる基礎素材。これがないと何も始まらない。（※テキストは後で変更）",
    iconType: "sword",
  },
  {
    id: "javascript",
    name: "JavaScript",
    rare: 2,
    level: 3,
    attack: "???,???,???",
    description:
      "Webの生態系を操るための必須装備。動的なギミックを付与する。（※テキストは後で変更）",
    iconType: "sword",
  },
  {
    id: "php",
    name: "PHP",
    rare: 2,
    level: 6,
    attack: "???,???,???",
    description:
      "実務の荒波で鍛え上げられた業物。長年の相棒として手に馴染んでいる。（※テキストは後で変更）",
    iconType: "greatsword",
  },
  {
    id: "ruby",
    name: "Ruby",
    rare: 2,
    level: 2,
    attack: "???,???,???",
    description:
      "美しさと書きやすさを備えた言語。かつて手にした記憶がある。（※テキストは後で変更）",
    iconType: "sword",
  },
  {
    id: "boki-3",
    name: "簿記3級",
    rare: 2,
    level: 4,
    attack: "???,???,???",
    description:
      "ビジネスの基礎属性を底上げする護石。お金の流れという概念を可視化する。（※テキストは後で変更）",
    iconType: "accessory",
  },
  {
    id: "typescript",
    name: "TypeScript",
    rare: 3,
    level: 5,
    attack: "???,???,???",
    description:
      "型という名の強固な盾を備えたJSの進化系。予期せぬエラー（事故）を未然に防ぐ。（※テキストは後で変更）",
    iconType: "shield",
  },
  {
    id: "sql",
    name: "SQL",
    rare: 3,
    level: 3,
    attack: "???,???,???",
    description:
      "データの地脈から必要な情報だけを抽出するピッケル的な技術。（※テキストは後で変更）",
    iconType: "tool",
  },
  {
    id: "react",
    name: "React",
    rare: 4,
    level: 6,
    attack: "???,???,???",
    description:
      "現代のフロントエンドにおける主力武器。コンポーネントという魔法を操る。（※テキストは後で変更）",
    iconType: "magic",
  },
  {
    id: "nextjs",
    name: "Next.js",
    rare: 4,
    level: 5,
    attack: "???,???,???",
    description:
      "Reactの力を極限まで引き出すフレームワーク。この世界（ポートフォリオ）を構築した要。（※テキストは後で変更）",
    iconType: "magic",
  },
  {
    id: "laravel",
    name: "Laravel",
    rare: 4,
    level: 6,
    attack: "???,???,???",
    description:
      "PHPの真価を発揮させる重量級フレームワーク。複雑な要求もエレガントに捌く。（※テキストは後で変更）",
    iconType: "heavy",
  },
  {
    id: "rails",
    name: "Ruby on Rails",
    rare: 4,
    level: 1,
    attack: "???,???,???",
    description:
      "レールに乗ることで爆速開発を可能にするフレームワーク。（※テキストは後で変更）",
    iconType: "heavy",
  },
  {
    id: "toeic",
    name: "TOEIC 795",
    rare: 4,
    level: 4,
    attack: "???,???,???",
    description:
      "言語の壁を越えて公式ドキュメント（古文書）を読み解くための特殊スキル。（※テキストは後で変更）",
    iconType: "book",
  },
  {
    id: "aws-saa",
    name: "AWS SAA",
    rare: 5,
    level: 2,
    attack: "???,???,???",
    description:
      "クラウドの広大な大地を設計・構築する許可証。高可用性アーキテクチャを描く。（※テキストは後で変更）",
    iconType: "certificate",
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
