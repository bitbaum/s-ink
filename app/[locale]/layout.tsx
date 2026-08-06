import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';

import { Atmosphere } from '@/components/Atmosphere';
import { RevealObserver } from '@/components/RevealObserver';
import { getDictionary, HTML_LANG, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import '../globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/** Every locale is prerendered at build time — there is no dynamic content. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const title = `${SITE.name} — ${t.role}`;
  const description = `${SITE.name} — ${t.role}. ${t.tagline}. ${SITE.artist}.`;

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      // Tells search engines these are the same page in different languages
      // rather than duplicates competing with each other.
      languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `/${l}`])),
    },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/${locale}`,
      siteName: SITE.name,
      images: [{ url: '/work/sami.webp', width: 1500, height: 938 }],
      type: 'website',
      locale: HTML_LANG[locale],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#050507',
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={HTML_LANG[locale as Locale]} className={`${display.variable} ${mono.variable}`}>
      <body>
        {/* Set before paint: reveal animations start hidden only when JS is
            present, so a no-JS visitor gets the whole page rather than a blank one. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <Atmosphere />
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
