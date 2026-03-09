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

function truncate(value: string, maxLength = 700) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 3)}...`
    : value;
}

function isBot(userAgent: string) {
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
  ];

  const lowerUserAgent = userAgent.toLowerCase();
  return botKeywords.some((keyword) => lowerUserAgent.includes(keyword));
}

function detectDevice(userAgent: string) {
  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("iphone")) return "📱 iPhone";
  if (lowerUserAgent.includes("ipad")) return "📱 iPad";
  if (lowerUserAgent.includes("android")) return "📱 Android";
  return "💻 Desktop";
}

function detectPlatform(
  userAgent: string,
  secChUaPlatform: string | null,
) {
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

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (isBot(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: PortfolioVisitPayload = {};

  try {
    payload = (await request.json()) as PortfolioVisitPayload;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await sendLineMessage(buildMessage(payload, request, userAgent));
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
