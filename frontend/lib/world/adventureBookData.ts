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
    location: "おおいた",
    skills: ["てにす", "ぶろすた", "でゅえま"],
    description: `うまれてから　ずっと　おおいた　で　そだった。
                  いみのない　ルールが　きらいだった。
                  まじめな　あのこらは　かっこいい。
                  でも　ぼくには　できなかった。
                  てんすうで　ひとの　かちは　はかれない。
                  せかいは　もっと　じゆうだと　しんじていた。`,
    hp: 180,
    hpMax: 180,
    mp: 60,
    mpMax: 60,
  },
  {
    id: 2,
    level: 23,
    job: "はうすきーぱー",
    location: "おおいた",
    skills: ["おそうじ", "Webかいはつ", "しんりきのう"],
    description: `ほてるせいそうを　４ねんかん　やりぬいた。
                  だいがくに　いった　にっすうの　２ばいいじょう。
                  ほんしょくは　はうすきーぱー　だった。
                  なにも　できなかった　じぶんに
                  あたまの　つかいかたと　ひとびとの　かがやきを
                  おしえてくれた　４ねんかん。`,
    hp: 230,
    hpMax: 230,
    mp: 200,
    mpMax: 200,
  },
  {
    id: 3,
    level: 24,
    job: "えんじにあ",
    location: "とうきょう",
    skills: ["PHP", "TypeScript", "AWS"],
    description: `できないこと　ふまんなこと　いらだつこと
                  それら　すべて　ぼくの　かいぞうどぶそく。
                  どりょくし　ひとをしり
                  じぶんを　しること。
                  じゆうに　じんせいを　あそび
                  けんきょに　さきへ　すすもう。`,
    hp: 240,
    hpMax: 240,
    mp: 220,
    mpMax: 220,
  },
];

export function getAdventureSlot(
  id: AdventureSlotId,
): AdventureSlot | undefined {
  return ADVENTURE_SLOTS.find((s) => s.id === id);
}
