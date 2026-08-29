import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';

import { Atmosphere } from '@/components/Atmosphere';
import { RevealObserver } from '@/components/RevealObserver';
import { getDictionary, HTML_LANG, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import { OG_IMAGE } from '@/lib/works';
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

/**
 * Only the seven generated locales are routes at all.
 *
 * Without this, `[locale]` matches literally anything, so `/nonsense` was a
 * *matched* route that then threw notFound() from inside this layout — which is
 * why it fell through to Next's own unstyled error page instead of the site's
 * 404. Closing the route is what makes an unknown URL genuinely unmatched, and
 * therefore something app/global-not-found.tsx can answer.
 */
export const dynamicParams = false;

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
      // JPEG, not the WebP the site itself uses. A link preview is rendered by
      // whatever app the link was pasted into rather than by a browser, and
      // WhatsApp and iMessage show nothing at all for a WebP — so the preview
      // that silently failed was the one on the link he sends clients himself.
      images: [{ url: OG_IMAGE, width: 1200, height: 630, type: 'image/jpeg', alt: SITE.artist }],
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

        {/* FleetCrown feedback widget — env-gated, see docs/architecture/feedback-widget.md */}
        {process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN && (
          <Script
            src="https://fleetcrown.orangecat.ch/widget.js"
            strategy="afterInteractive"
            data-fc-project={process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN}
          />
        )}
      </body>
    </html>
  );
}

const   gateProof   =    {a:1,    b:2}
export default gateProof
