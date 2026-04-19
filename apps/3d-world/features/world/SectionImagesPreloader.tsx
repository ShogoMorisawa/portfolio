"use client";

import { useEffect } from "react";
import { preloadSectionImages } from "@/features/world/preloadWorldImages";

/**
 * ワールド（3D）の初期ロードが終わり、このコンポーネントがマウントされたタイミングで
 * Post / Box / Computer 用画像のプリロードを 1 回だけ開始する。
 * Suspense の子として配置しているため、マウント = 操作可能になった直後。
 */
export function SectionImagesPreloader() {
  useEffect(() => {
    preloadSectionImages();
  }, []);
  return <group />;
}
