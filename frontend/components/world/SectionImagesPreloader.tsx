"use client";

import { useEffect } from "react";
import { preloadSectionImages } from "@/lib/world/preloadSectionImages";

/**
 * ワールド（3D）の初期ロードが終わり、このコンポーネントがマウントされたタイミングで
 * PostUI / BoxUI 用画像のプリロードを 1 回だけ開始する。
 * Suspense の子として配置しているため、マウント = 操作可能になった直後。
 */
export function SectionImagesPreloader() {
  useEffect(() => {
    preloadSectionImages();
  }, []);
  return <group />;
}
