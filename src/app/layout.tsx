import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Geologica } from "next/font/google";
import "./globals.css";

const display = Familjen_Grotesk({
  display: "swap",
  variable: "--font-display",
  subsets: ["latin"],
});

const detail = Geologica({
  display: "swap",
  variable: "--font-detail",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enginara | You imagine. We build. We manage.",
  description:
    "Enginara builds custom software, automates business workflows, and provides the technical support that keeps every system useful.",
  keywords: [
    "custom software development",
    "workflow automation",
    "technical support",
    "business systems",
    "Enginara",
  ],
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#171717",
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
