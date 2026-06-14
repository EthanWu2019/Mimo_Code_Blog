import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import GlobalBackground from "@/components/GlobalBackground";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethan's Blog",
  description: "Thoughts on software engineering, design, and building products.",
};

// Cookie cleaner script to prevent 494 errors
const cookieCleanerScript = `
  (function() {
    var cookies = document.cookie.split(';');
    var totalSize = 0;
    cookies.forEach(function(cookie) { totalSize += cookie.length; });
    if (totalSize > 4000) {
      console.warn('[Cookie Cleaner] Cookies too large (' + totalSize + ' bytes), clearing...');
      var names = ['next-auth.session-token','next-auth.callback-url','next-auth.csrf-token','__Secure-next-auth.session-token','__Secure-next-auth.callback-url','__Secure-next-auth.csrf-token','__Host-next-auth.csrf-token'];
      names.forEach(function(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      });
      window.location.reload();
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body style={{ background: 'var(--background)', margin: 0 }}>
        <script dangerouslySetInnerHTML={{ __html: cookieCleanerScript }} />
        <GlobalBackground />
        <Providers>{children}</Providers>
        <BackToTop />
      </body>
    </html>
  );
}
