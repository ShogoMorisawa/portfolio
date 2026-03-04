/**
 * PostUI / BoxUI で使う画像を事前にダウンロードする。
 * ワールド表示・操作可能になったタイミングで 1 回だけ呼ぶ想定。
 */

import { getBoxImageUrls } from "./boxData";

/** PostUI で使用する画像URL（表示とプリロードで一元化） */
export const POST_UI_IMAGE_URLS: readonly string[] = [
  "/post/letter.png",
  "/post/stamp.png",
  "/post/form_input.png",
  "/post/send-button.png",
];

function preloadImage(url: string): void {
  const img = new Image();
  img.src = url;
}

/**
 * Post 用 → 続けて Box 用の順でプリロードを開始する。
 * 完了を待たずに開始するだけ（キャッシュに入れば UI 表示時に即反映される）。
 */
export function preloadSectionImages(): void {
  POST_UI_IMAGE_URLS.forEach(preloadImage);
  getBoxImageUrls().forEach(preloadImage);
}
