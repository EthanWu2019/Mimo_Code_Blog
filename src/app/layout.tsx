import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import GlobalBackground from "@/components/GlobalBackground";
import BackToTop from "@/components/BackToTop";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ethan's Blog",
  description: "Thoughts on software engineering, design, and building products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body>
        <GlobalBackground />
        <Providers>{children}</Providers>
        <BackToTop />
      </body>
    </html>
  );
}
