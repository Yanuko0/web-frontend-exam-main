import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HeroBackground from '../components/HeroBackground';
import { FADE_MASK, HERO_HEIGHT, HERO_SOURCES } from '../components/heroSources';
import PageLoader from '../components/PageLoader';
import { useI18n } from '../i18n';

// The page is interactive-only (media queries, pointer effects), so it renders
// on the client; the branded loader is what the first paint shows.
const App = dynamic(() => import('../App'), { ssr: false, loading: () => <PageLoader /> });

// Absolute URL of the deployed site (hreflang must be absolute); on Vercel it is derived.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '');

export default function Home() {
  const { t } = useI18n();
  const { locales, defaultLocale } = useRouter();

  return (
    <>
      <Head>
        <title>{t('app.title')}</title>
        <meta name="description" content={t('app.description')} />
        {/* The hero pictures decide the first paint: fetch them before the app code runs. */}
        {['background', 'character'].map((name) => (
          <link
            key={name}
            rel="preload"
            as="image"
            href={HERO_SOURCES[name].src}
            imageSrcSet={HERO_SOURCES[name].srcSet}
            imageSizes={HERO_SOURCES[name].sizes}
            fetchPriority="high"
          />
        ))}
        {/* One alternate link per language helps search engines pick the right one. */}
        {SITE_URL && locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={`${SITE_URL}${locale === defaultLocale ? '' : `/${locale}`}`}
          />
        ))}
      </Head>
      {/* The picture stays in place while the loader is replaced by the app, so the
          largest paint happens once, with the HTML. */}
      <div className="hero-slot" aria-hidden>
        <HeroBackground />
      </div>
      <App />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>
        {`
          .hero-slot {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1;
            height: ${HERO_HEIGHT.xs};
            overflow: hidden;
            pointer-events: none;
            background: #f0f0f0;
          }
          @media (min-width: 900px) {
            .hero-slot {
              height: ${HERO_HEIGHT.md};
              background: transparent;
              -webkit-mask-image: ${FADE_MASK};
              mask-image: ${FADE_MASK};
            }
          }
        `}
      </style>
    </>
  );
}
