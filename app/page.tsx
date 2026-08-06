import { Book } from '@/components/Book';
import { Footer } from '@/components/Footer';
import { Gallery } from '@/components/Gallery';
import { Hero } from '@/components/Hero';
import { Nav } from '@/components/Nav';
import { Reel } from '@/components/Reel';
import { Studio } from '@/components/Studio';
import { Styles } from '@/components/Styles';
import { Ticker } from '@/components/Ticker';
import { LINKS, SITE } from '@/lib/site';
import { REELS, WORKS } from '@/lib/works';

/**
 * Tells search engines this is a tattoo parlour in Berlin rather than a
 * personal page — the difference between showing up in a local search and not.
 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TattooParlor',
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  image: `${SITE.url}/work/owl.webp`,
  // No address and no sameAs until real ones exist — inventing either would put
  // a wrong location into search results, which is worse than omitting it.
  ...(LINKS.length > 0 ? { sameAs: LINKS.map((l) => l.href) } : {}),
};

export default function Page() {
  const plate = WORKS.find((w) => w.id === 'dobermann');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Nav />
      <main>
        <Hero pieceCount={WORKS.length} />
        <Ticker />
        <Gallery works={WORKS} />
        <Reel reels={REELS} />
        <Styles />
        <Studio plate={plate} />
        <Book />
      </main>
      <Footer year={new Date().getFullYear()} />
    </>
  );
}
