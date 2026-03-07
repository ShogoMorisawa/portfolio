import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DotGothic16,
  Dancing_Script,
  Playfair_Display,
} from "next/font/google";
import { ClarityProvider } from "@/components/providers/ClarityProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dotGothic16 = DotGothic16({
  weight: "400",
  variable: "--font-adventure",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  weight: "700",
  variable: "--font-dancing",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  weight: "400",
  variable: "--font-playfair",
  subsets: ["latin"],
});

const siteTitle = "Shogo Morisawa Portfolio";
const siteDescription = "森澤翔吾のポートフォリオサイト。";
const siteUrl = "https://shogomorisawa.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: siteTitle,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dotGothic16.variable} ${dancingScript.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ClarityProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
