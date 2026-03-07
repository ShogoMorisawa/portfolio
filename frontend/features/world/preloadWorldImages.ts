import { getBoxImageUrls } from "@/features/box/boxData";
import { POST_IMAGE_URLS } from "@/features/post/postAssets";

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}

export function preloadSectionImages(): void {
  POST_IMAGE_URLS.forEach(preloadImage);
  getBoxImageUrls().forEach(preloadImage);
}
