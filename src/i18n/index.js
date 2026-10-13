import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_LOCALE, LOCALES } from './config';
import zhTW from './messages/zh-TW';
import en from './messages/en';
import ja from './messages/ja';

const MESSAGES = { 'zh-TW': zhTW, en, ja };

/**
 * Looks up `key` for `locale`, falling back to the default language and then
 * to the key itself, and fills `{name}` placeholders from `params`.
 */
export function translate(locale, key, params) {
  const template = MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) => params?.[name] ?? match);
}

/** Normalizes any tag (e.g. "en-US", "ja-JP") to a supported locale. */
export function resolveLocale(tag) {
  if (LOCALES.includes(tag)) return tag;
  const language = String(tag || '').split('-')[0].toLowerCase();
  return LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === language)
    ?? DEFAULT_LOCALE;
}

const defaultValue = {
  locale: DEFAULT_LOCALE,
  t: (key, params) => translate(DEFAULT_LOCALE, key, params),
};

const I18nContext = createContext(defaultValue);

export function I18nProvider({ locale, children }) {
  const current = resolveLocale(locale);
  const value = useMemo(() => ({
    locale: current,
    t: (key, params) => translate(current, key, params),
  }), [current]);

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

I18nProvider.propTypes = {
  locale: PropTypes.string,
  children: PropTypes.node.isRequired,
};

I18nProvider.defaultProps = {
  locale: DEFAULT_LOCALE,
};

/**
 * Translates API option labels (education / salary levels) by id, e.g.
 * `education.4`; ids without a translation keep the label from the API.
 */
export function localizeOptions(options, prefix, t) {
  return options.map(({ id, label }) => {
    const text = t(`${prefix}.${id}`);
    return { id, label: text === `${prefix}.${id}` ? label : text };
  });
}

/** Returns `{ locale, t }`; works without a provider (zh-TW). */
export function useI18n() {
  return useContext(I18nContext);
}
