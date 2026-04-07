import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import MatrixRain from "./components/MatrixRain";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Type Rush — Enter the Matrix",
  description: "A cinematic typing game. Type fast, chain combos, survive the rush.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
