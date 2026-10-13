import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  I18nProvider, localizeOptions, resolveLocale, translate, useI18n,
} from './index';
import { DEFAULT_LOCALE, LOCALES } from './config';
import zhTW from './messages/zh-TW';
import en from './messages/en';
import ja from './messages/ja';

const nextConfig = require('../../next.config');

describe('translate', () => {
  it('fills placeholders', () => {
    expect(translate('en', 'app.count', { count: 12 })).toBe('12 jobs');
    expect(translate('ja', 'app.count', { count: 12 })).toBe('12 件の求人');
  });

  it('falls back to the default language, then to the key', () => {
    expect(translate('fr', 'card.view')).toBe(zhTW['card.view']);
    expect(translate('en', 'no.such.key')).toBe('no.such.key');
  });
});

describe('message catalogs', () => {
  it('have exactly the same keys in every language', () => {
    const keys = Object.keys(zhTW).sort();
    expect(Object.keys(en).sort()).toEqual(keys);
    expect(Object.keys(ja).sort()).toEqual(keys);
  });

  it('use the same placeholders in every language', () => {
    const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort();
    Object.keys(zhTW).forEach((key) => {
      expect(placeholders(en[key])).toEqual(placeholders(zhTW[key]));
      expect(placeholders(ja[key])).toEqual(placeholders(zhTW[key]));
    });
  });

  it('match the locales configured for Next.js routing', () => {
    expect(nextConfig.i18n.locales).toEqual(LOCALES);
    expect(nextConfig.i18n.defaultLocale).toBe(DEFAULT_LOCALE);
  });
});

describe('resolveLocale', () => {
  it('maps regional tags to a supported locale', () => {
    expect(resolveLocale('en-US')).toBe('en');
    expect(resolveLocale('ja-JP')).toBe('ja');
    expect(resolveLocale('zh-TW')).toBe('zh-TW');
  });

  it('falls back to the default locale', () => {
    expect(resolveLocale('fr')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });
});

describe('localizeOptions', () => {
  it('translates known ids and keeps the API label otherwise', () => {
    const t = (key, params) => translate('en', key, params);
    const result = localizeOptions([{ id: '4', label: '大學' }, { id: '99', label: '其他' }], 'education', t);
    expect(result).toEqual([
      { id: '4', label: "Bachelor's degree" },
      { id: '99', label: '其他' },
    ]);
  });
});

describe('I18nProvider', () => {
  function Probe() {
    const { locale, t } = useI18n();
    return <p>{`${locale}: ${t('card.view')}`}</p>;
  }

  it('provides the active locale to children', () => {
    render(<I18nProvider locale="en-GB"><Probe /></I18nProvider>);
    expect(screen.getByText('en: View details')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('defaults to zh-TW without a provider', () => {
    render(<Probe />);
    expect(screen.getByText('zh-TW: 查看細節')).toBeInTheDocument();
  });
});
