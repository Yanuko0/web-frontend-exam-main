import React from 'react';
import {
  Head, Html, Main, NextScript,
} from 'next/document';
import fontLoaderScript from '../fontLoaderScript';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="theme-color" content="#EE8D2B" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The font stylesheet is huge (one rule per CJK slice) and must not block the first
            paint: it loads as "print" media and is switched to "all" when it arrives. Text
            shows in a system font first (display=swap) and then upgrades. The script is a
            constant (src/fontLoaderScript.js) allowed by its hash in the CSP. */}
        <link id="font-css" rel="stylesheet" href={FONT_URL} media="print" />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: fontLoaderScript }} />
        <noscript>
          <link rel="stylesheet" href={FONT_URL} />
        </noscript>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
