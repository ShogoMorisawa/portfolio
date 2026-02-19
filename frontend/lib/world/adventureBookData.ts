/**
 * ぼうけんのしょ（セーブデータ風）の表示用データ
 */

export type AdventureSlotId = 1 | 2 | 3;

export interface AdventureSlot {
  id: AdventureSlotId;
  /** 表示用レベル（当時の年齢） */
  level: number;
  /** しょくぎょう（ひらがな） */
  job: string;
  /** ばしょ */
  location: string;
  /** スキル（とくぎ）一覧 */
  skills: string[];
  /** せつめい（ひらがな、レトロ調） */
  description: string;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
}

export const ADVENTURE_SLOTS: AdventureSlot[] = [
  {
    id: 1,
    level: 18,
    job: "こうこうせい",
    location: "SAITAMA",
    skills: [],
    description:
      "こうこうじだいの　ぼうけん。さいたまの　まちで　すごした　ひび。",
    hp: 180,
    hpMax: 180,
    mp: 60,
    mpMax: 60,
  },
  {
    id: 2,
    level: 22,
    job: "だいがくせい",
    location: "BEPPU, OITA",
    skills: [
      "はうすきーぴんぐ（4ねん）",
      "ｗｅｂかいはつ（どくがく）",
      "あわーす（SAA）",
    ],
    description:
      "ほてるせいそうを　４ねんかん　やりぬいた。だいがくに　いった　ひすうの　２ばいいじょう。だいがくは　おまけの　ようなもの。ほんしょくは　はうすきーぱー　だった。どくがくで　ｗｅｂかいはつを　べんきょうした。",
    hp: 230,
    hpMax: 230,
    mp: 200,
    mpMax: 200,
  },
  {
    id: 3,
    level: 24,
    job: "えんじにあ",
    location: "TOKYO",
    skills: [],
    description:
      "とうきょうで　えんじにあとしての　ぼうけんが　はじまった。しんの　せかいへ。",
    hp: 240,
    hpMax: 240,
    mp: 220,
    mpMax: 220,
  },
];

export function getAdventureSlot(id: AdventureSlotId): AdventureSlot | undefined {
  return ADVENTURE_SLOTS.find((s) => s.id === id);
}
