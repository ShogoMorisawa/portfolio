import { useState, useEffect } from "react";

export const useDeviceType = () => {
  // 初期値はPC扱い（false）にしておく
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 768px未満ならスマホとみなす（Tailwindのmdブレークポイント基準）
      setIsMobile(window.innerWidth < 768);
    };

    // 初回実行
    handleResize();

    // 画面サイズが変わった時も再判定
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
