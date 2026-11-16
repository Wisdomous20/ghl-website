import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";

const display = Sora({
  display: "swap",
  variable: "--font-display",
  subsets: ["latin"],
});

const detail = Manrope({
  display: "swap",
  variable: "--font-detail",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enginara | You imagine. We build. We manage.",
  description:
    "Enginara provides software and technology solutions, streamlined business operations, AI integrations and automation, and people and managed support services.",
  keywords: [
    "custom software development",
    "workflow automation",
    "technical support",
    "business systems",
    "Enginara",
  ],
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ded9d1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${detail.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
