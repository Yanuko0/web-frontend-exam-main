import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { I18nProvider } from '../i18n';

// The language comes from the URL prefix (/en, /ja), which Next.js picks from the
// browser's Accept-Language header on first visit and remembers in a cookie.
export default function MyApp({ Component, pageProps }) {
  const { locale } = useRouter();

  return (
    <I18nProvider locale={locale}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </I18nProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.shape({}),
};

MyApp.defaultProps = {
  pageProps: {},
};
