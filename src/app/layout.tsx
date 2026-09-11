import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { auth } from "@/lib/auth";
import GlobalBackground from "@/components/GlobalBackground";
import SiteFooter from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CursorGlow from "@/components/CursorGlow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ethan Wu",
    template: "%s · Ethan Wu",
  },
  description:
    "Ethan Wu — software engineer based in St. Louis. Full-stack product engineering, ML systems, and selected writing on the craft of building software.",
  metadataBase: new URL("https://ethanwu.work"),
  openGraph: {
    type: "website",
    siteName: "Ethan Wu",
    url: "https://ethanwu.work",
    title: "Ethan Wu",
    description:
      "Software engineer based in St. Louis. Full-stack product engineering, ML systems, and selected writing on the craft of building software.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethan Wu",
    description:
      "Software engineer based in St. Louis. Full-stack product engineering, ML systems, and selected writing on the craft of building software.",
  },
  alternates: {
    canonical: "https://ethanwu.work",
  },
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read the session on the server so the navbar can render the
  // correct auth CTA (Login / Register / avatar) on the very first
  // paint, instead of flashing a loading skeleton until the
  // client-side useSession() resolves.
  const session = await auth();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Mobile-first responsive viewport. Without this, mobile
            browsers render at desktop width and then downscale, which
            makes sm:/md:/lg: breakpoints meaningless. viewport-fit=cover
            plus safe-area-inset-* on body give us proper support for
            notched phones (iPhone 14+, Sony Xperia) without clipping
            the navbar under the notch. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.classList.add(t);else document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();` }} />
      </head>
      <body style={{ background: 'var(--background)', margin: 0 }}>
        <script dangerouslySetInnerHTML={{ __html: cookieCleanerScript }} />
        <GlobalBackground />
        <Providers initialSession={session}>
          {children}
        </Providers>
        <SiteFooter />
        <BackToTop />
        <CursorGlow />
      </body>
    </html>
  );
}
