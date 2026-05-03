export interface ComputerWork {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  href?: string;
}

export const COMPUTER_WORKS: ComputerWork[] = [
  {
    id: "oox",
    imageSrc: "/computer/oox.png",
    title: "OoX",
    description:
      "ユングの心理機能8種類を判断の優先順で羅列して、4つの階層に分けて、さらに各機能の健全度まで測る。そうすることで、人の性格をより詳しく記述できる気がして作り始めた、まだまだこれからの試作品です。",
    href: "https://oox-seven.vercel.app/",
  },
  {
    id: "cat",
    imageSrc: "/computer/cat.png",
    title: "猫ちゃん",
    description:
      "webデザイナーにでもなろうかと思って、絵描いて飾る額縁としてサイトを作ろうと思ったのが、プログラミングを本格的に始めるきっかけでした。",
  },
];

export const COMPUTER_IMAGE_URLS = [
  "/computer/frame.png",
  ...COMPUTER_WORKS.map((work) => work.imageSrc),
] as const;
