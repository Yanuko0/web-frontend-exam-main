import background from '../assets/hero-bg.webp';
import backgroundSmall from '../assets/hero-bg-sm.webp';
import character from '../assets/hero-character.webp';
import characterSmall from '../assets/hero-character-sm.webp';
import logo from '../assets/hero-logo.webp';
import logoSmall from '../assets/hero-logo-sm.webp';
import assetUrl from '../utils/asset';

// Figma frame sizes (desktop and mobile hero).
export const FRAMES = {
  desktop: { width: 1440, height: 823 },
  mobile: { width: 375, height: 238 },
};

// Visible hero height; the content panel overlaps the lower part of it.
export const HERO_HEIGHT = {
  xs: `${(FRAMES.mobile.height / FRAMES.mobile.width) * 100}vw`,
  md: `min(${(FRAMES.desktop.height / FRAMES.desktop.width) * 100}vw, ${FRAMES.desktop.height}px)`,
};

// Desktop only: the content panel overlaps the hero, so its bottom fades into the backdrop.
export const FADE_MASK = 'linear-gradient(to bottom, #000 80%, transparent 100%)';

// Each picture comes in two widths; the browser picks by the size it will be shown at
// (phones download ~140KB less than desktops).
const source = (small, smallWidth, large, largeWidth, sizes) => ({
  src: assetUrl(large),
  srcSet: `${assetUrl(small)} ${smallWidth}w, ${assetUrl(large)} ${largeWidth}w`,
  sizes,
});

export const HERO_SOURCES = {
  background: source(backgroundSmall, 1080, background, 2160, '(min-width: 900px) 1440px, 100vw'),
  character: source(characterSmall, 700, character, 1646, '(min-width: 900px) 1097px, 85vw'),
  logo: source(logoSmall, 400, logo, 810, '(min-width: 900px) 540px, 37vw'),
};
