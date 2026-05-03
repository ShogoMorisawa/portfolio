import { NextRequest, NextResponse } from "next/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

type PortfolioVisitPayload = {
  url?: string;
  path?: string;
  referer?: string;
  referrerPolicy?: string;
  language?: string;
  languages?: string[];
  timezone?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
};

type ClassificationResult = {
  isSuspicious: boolean;
  reasons: string[];
  score: number;
};

function truncate(value: string, maxLength = 700) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 3)}...`
    : value;
}

// secChUaを引数に追加し、HeadlessやGPTBotを検知
function isBot(userAgent: string, secChUa: string = "") {
  const botKeywords = [
    "bot",
    "crawler",
    "spider",
    "facebookexternalhit",
    "slackbot",
    "discordbot",
    "googlebot",
    "bingbot",
    "headless",
    "preview",
    "wget",
    "curl",
    "python-requests",
    "python/",
    "aiohttp",
    "scrapy",
    "axios",
    "okhttp",
    "java/",
    "node-fetch",
    "vercel-screenshot",
    "httpclient",
    "go-http-client",
    "uptime",
    "monitor",
    "letsencrypt",
    "gptbot",
  ];

  const lowerUserAgent = userAgent.toLowerCase();
  const lowerSecChUa = secChUa.toLowerCase();

  if (botKeywords.some((keyword) => lowerUserAgent.includes(keyword))) {
    return true;
  }

  if (lowerSecChUa.includes("headlesschrome")) {
    return true;
  }

  return false;
}

function classifyRequest(
  request: NextRequest,
  payload: PortfolioVisitPayload,
  userAgent: string,
): ClassificationResult {
  const reasons: string[] = [];
  let score = 0;

  const lowerUserAgent = userAgent.toLowerCase();
  const acceptLanguage = request.headers.get("accept-language") || "unknown";
  const referer = payload.referer || "Direct/None";

  if (request.method.toUpperCase() != "POST") {
    reasons.push("non_post_method");
    score += 2;
  }

  if (acceptLanguage === "unknown") {
    reasons.push("missing_accept_language");
    score += 1;
  }

  if (referer === "Direct/None") {
    reasons.push("missing_referer");
    score += 1;
  }

  if (lowerUserAgent.includes("nexus 5")) {
    reasons.push("legacy_nexus_5");
    score += 1;
  }

  if (lowerUserAgent.includes("linux i686")) {
    reasons.push("legacy_linux_i686");
    score += 1;
  }

  if (lowerUserAgent.includes("iphone os 10_")) {
    reasons.push("legacy_ios_10");
    score += 1;
  }

  if (lowerUserAgent.includes("android 6.0")) {
    reasons.push("legacy_android_6");
    score += 1;
  }

  if (lowerUserAgent.includes("line/") && lowerUserAgent.includes("iab")) {
    reasons.push("trusted_line_iab");
    score -= 1;
  }

  if (lowerUserAgent.includes("instagram")) {
    reasons.push("trusted_instagram_iab");
    score -= 1;
  }

  if (lowerUserAgent.includes("; wv)") || lowerUserAgent.includes(" wv")) {
    reasons.push("trusted_webview");
    score -= 1;
  }

  return {
    isSuspicious: score >= 2,
    reasons,
    score,
  };
}

function detectDevice(userAgent: string) {
  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("iphone")) return "📱 iPhone";
  if (lowerUserAgent.includes("ipad")) return "📱 iPad";
  if (lowerUserAgent.includes("android")) return "📱 Android";
  return "💻 Desktop";
}

function detectPlatform(userAgent: string, secChUaPlatform: string | null) {
  if (secChUaPlatform) return secChUaPlatform;

  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("iphone") || lowerUserAgent.includes("ipad")) {
    return "iOS";
  }
  if (lowerUserAgent.includes("android")) return "Android";
  if (lowerUserAgent.includes("mac os")) return "macOS";
  if (lowerUserAgent.includes("windows")) return "Windows";
  if (lowerUserAgent.includes("linux")) return "Linux";
  return "unknown";
}

function detectBrowser(userAgent: string) {
  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("edg/")) return "Edge";
  if (lowerUserAgent.includes("chrome/")) return "Chrome";
  if (lowerUserAgent.includes("firefox/")) return "Firefox";
  if (lowerUserAgent.includes("safari/")) return "Safari";
  return "unknown";
}

function formatTimestamp() {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function buildMessage(
  payload: PortfolioVisitPayload,
  request: NextRequest,
  userAgent: string,
) {
  const secChUa = request.headers.get("sec-ch-ua") || "unknown";
  const secChUaMobile = request.headers.get("sec-ch-ua-mobile") || "unknown";
  const secChUaPlatform = request.headers.get("sec-ch-ua-platform");

  return [
    "💎 Portfolio Access Detected",
    "━━━━━━━━━━━━",
    "🕒 Timestamp",
    formatTimestamp(),
    "",
    "🌐 Page",
    `URL: ${payload.url || "unknown"}`,
    `Path: ${payload.path || "/"}`,
    "",
    "🔗 Referrer",
    `Referer: ${payload.referer || "Direct/None"}`,
    `Referrer Policy: ${payload.referrerPolicy || "unknown"}`,
    "",
    "📱 Device",
    `Device: ${detectDevice(userAgent)}`,
    `Platform: ${detectPlatform(userAgent, secChUaPlatform)}`,
    `Browser: ${detectBrowser(userAgent)}`,
    "",
    "🪟 Display",
    `Screen: ${payload.screenWidth ?? "unknown"}x${payload.screenHeight ?? "unknown"}`,
    `Viewport: ${payload.viewportWidth ?? "unknown"}x${payload.viewportHeight ?? "unknown"}`,
    `Pixel Ratio: ${payload.devicePixelRatio ?? "unknown"}`,
    "",
    "🗺️ Environment",
    `Language: ${payload.language || "unknown"}`,
    `Languages: ${(payload.languages || []).join(", ") || "unknown"}`,
    `Timezone: ${payload.timezone || "unknown"}`,
    "",
    "🧾 Client Hints",
    `sec-ch-ua: ${secChUa}`,
    `sec-ch-ua-mobile: ${secChUaMobile}`,
    `sec-ch-ua-platform: ${secChUaPlatform || "unknown"}`,
    "",
    "📝 User-Agent",
    truncate(userAgent),
  ].join("\n");
}

async function sendLineMessage(message: string) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) return;

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: LINE_USER_ID,
      messages: [{ type: "text", text: message }],
    }),
  });
}

function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "unknown";
  const secChUa = request.headers.get("sec-ch-ua") || "";

  if (isBot(userAgent, secChUa)) {
    return noContentResponse();
  }

  let payload: PortfolioVisitPayload = {};

  try {
    payload = (await request.json()) as PortfolioVisitPayload;
  } catch {
    return noContentResponse();
  }

  const classification = classifyRequest(request, payload, userAgent);

  if (classification.isSuspicious) {
    return noContentResponse();
  }

  const message = buildMessage(payload, request, userAgent);

  // サーバーレス環境ではレスポンス返却後に実行が停止されるため、送信完了まで待つ
  try {
    await sendLineMessage(message);
  } catch (err) {
    console.error("LINE Notification Failed:", err);
  }

  return noContentResponse();
}
