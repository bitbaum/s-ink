import { notFound } from 'next/navigation';

import { Book } from '@/components/Book';
import { Footer } from '@/components/Footer';
import { Gallery } from '@/components/Gallery';
import { Hero } from '@/components/Hero';
import { Nav } from '@/components/Nav';
import { Reel } from '@/components/Reel';
import { StickyBook } from '@/components/StickyBook';
import { Studio } from '@/components/Studio';
import { Styles } from '@/components/Styles';
import { Ticker } from '@/components/Ticker';
import { getDictionary, HTML_LANG, isLocale } from '@/lib/i18n';
import { LINKS, SITE } from '@/lib/site';
import { getReels, getWorks } from '@/lib/works';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const works = getWorks(t);
  const reels = getReels();
  const plate = works.find((w) => w.id === 'dobermann');

  /**
   * Tells search engines this is a tattoo parlour rather than a personal page.
   * No address and no sameAs until real ones exist — inventing either would put
   * a wrong location into search results, which is worse than omitting it.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TattooParlor',
    name: SITE.name,
    description: `${SITE.name} — ${t.role}. ${t.tagline}.`,
    url: `${SITE.url}/${locale}`,
    image: `${SITE.url}/work/sami.webp`,
    inLanguage: HTML_LANG[locale],
    employee: { '@type': 'Person', name: SITE.artist, jobTitle: t.role },
    ...(LINKS.length > 0 ? { sameAs: LINKS.map((l) => l.href) } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="skip-link" href="#work">
        {t.nav.work}
      </a>
      <Nav t={t} locale={locale} />
      <main>
        <Hero t={t} pieceCount={works.length} />
        <Ticker t={t} />
        <Gallery t={t} works={works} />
        <Reel t={t} reels={reels} />
        <Styles t={t} />
        <Studio t={t} plate={plate} />
        <Book t={t} />
      </main>
      <Footer t={t} year={new Date().getFullYear()} />
      <StickyBook t={t} />
    </>
  );
}
