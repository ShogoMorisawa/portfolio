/** コンピューターセクションで表示する作品データ */
export interface ComputerWorkEntry {
  id: string;
  title: string;
  description: string;
  /** 画像パス（public からの相対パス）。未設定の場合はプレースホルダー表示 */
  imageSrc?: string;
}

export const COMPUTER_WORKS: ComputerWorkEntry[] = [
  {
    id: "1",
    title: "作品タイトル 1",
    description:
      "ここに作品の説明文を書きます。技術スタックやこだわり、リンクなども追加できます。",
    imageSrc: "/works/1.jpg",
  },
  {
    id: "2",
    title: "作品タイトル 2",
    description:
      "2つ目の作品の説明。画像は public/works/ に配置すると表示されます。",
    imageSrc: "/works/2.jpg",
  },
  {
    id: "3",
    title: "作品タイトル 3",
    description: "画像なしの場合はプレースホルダーが表示されます。",
  },
];
