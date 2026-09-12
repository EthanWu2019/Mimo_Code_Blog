import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { auth } from "@/lib/auth";
import GlobalBackground from "@/components/GlobalBackground";
import SiteFooter from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CursorGlow from "@/components/CursorGlow";
import CookieConsent from "@/components/CookieConsent";

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
    template: "Ethan Wu | %s",
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
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Ethan Wu — full-stack software engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethan Wu",
    description:
      "Software engineer based in St. Louis. Full-stack product engineering, ML systems, and selected writing on the craft of building software.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://ethanwu.work",
  },
  manifest: "/manifest.json",
  icons: {
    // Default favicon (browsers fall back through these sizes in order).
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    // iOS "Add to Home Screen" — uses the same rounded-rect master PNG.
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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

  // JSON-LD Person schema — helps Google render a knowledge card for
  // name searches (recruiter searches "Chengze Wu" / "Ethan Wu").
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Chengze Wu',
    alternateName: 'Ethan Wu',
    jobTitle: 'Software Engineer',
    url: 'https://ethanwu.work',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Washington University in St. Louis',
    },
    sameAs: [
      'https://github.com/EthanWu2019',
      'https://www.linkedin.com/in/chengze-wu-3398a0224/',
      'https://ethanwu.cafe/',
    ],
  };

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: cookieCleanerScript }} />
        <GlobalBackground />
        <Providers initialSession={session}>
          {children}
        </Providers>
        <BackToTop />
        <CursorGlow />
        <CookieConsent />
      </body>
    </html>
  );
}
