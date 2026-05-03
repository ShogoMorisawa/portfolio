import { useEffect, useState } from "react";

export type ScreenTier = "mobile" | "tablet" | "desktop" | "wide";

const getScreenTier = (width: number): ScreenTier => {
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  if (width < 1920) return "desktop";
  return "wide";
};

export const useDeviceType = () => {
  // 初期値は既存挙動に寄せて desktop にしておく
  const [screenTier, setScreenTier] = useState<ScreenTier>("desktop");

  useEffect(() => {
    const handleResize = () => {
      setScreenTier(getScreenTier(window.innerWidth));
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenTier;
};
