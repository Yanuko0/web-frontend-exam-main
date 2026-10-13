import React from 'react';
import { FRAMES, HERO_SOURCES } from './heroSources';

const { width: DESIGN_WIDTH } = FRAMES.desktop;
// Beyond the design width the sharp picture keeps its proportions (no endless
// upscaling) and its sides dissolve into the blurred page backdrop.
const SIDE_MASK = 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)';

/**
 * The hero background picture. It is the page's largest contentful paint, so it
 * is rendered immediately (also by the first-paint loader, on the server) and
 * never faded in. It is styled with styled-jsx, which is server-rendered, so
 * the picture shows up with the HTML instead of waiting for client-side styles.
 */
export default function HeroBackground() {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        className="hero-background"
        src={HERO_SOURCES.background.src}
        srcSet={HERO_SOURCES.background.srcSet}
        sizes={HERO_SOURCES.background.sizes}
        alt=""
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="high"
        decoding="async"
        draggable={false}
      />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>
        {`
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          user-select: none;
        }
        @media (min-width: 900px) {
          .hero-background {
            left: 50%;
            width: min(100%, ${DESIGN_WIDTH}px);
            transform: translateX(-50%);
          }
        }
        @media (min-width: ${DESIGN_WIDTH + 1}px) {
          .hero-background {
            -webkit-mask-image: ${SIDE_MASK};
            mask-image: ${SIDE_MASK};
          }
        }
      `}
      </style>
    </>
  );
}
