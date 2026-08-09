import type { Metadata } from "next";
import { Familjen_Grotesk, Geologica } from "next/font/google";
import "./globals.css";

const display = Familjen_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const detail = Geologica({
  variable: "--font-detail",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ops&Code | You imagine. We build. We manage.",
  description:
    "Ops&Code turns ambitious ideas into custom software and dependable systems, then keeps them useful as your business evolves.",
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
