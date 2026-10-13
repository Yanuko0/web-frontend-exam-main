import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { keyframes, useTheme } from '@mui/material/styles';
import eyeLeft from '../assets/eye-left.svg';
import eyeRight from '../assets/eye-right.svg';
import useImagesReady from '../hooks/useImagesReady';
import assetUrl from '../utils/asset';
import { useI18n } from '../i18n';
import BrandDots from './BrandDots';
import {
  FADE_MASK, FRAMES, HERO_HEIGHT, HERO_SOURCES,
} from './heroSources';

// Layouts taken from the Figma frames. The background always fills the whole
// hero (cover); the character and logo are placed inside a frame that scales
// with the hero height.
const LAYOUTS = {
  desktop: {
    frame: FRAMES.desktop,
    character: {
      x: 0, y: 0, width: 1097, height: 823,
    },
    logo: {
      x: 818, y: 365, width: 540, height: 323,
    },
  },
  mobile: {
    frame: FRAMES.mobile,
    character: {
      x: 0, y: 0, width: 317, height: 238,
    },
    logo: {
      x: 227, y: 133, width: 137, height: 82,
    },
  },
};

export const PANEL_OFFSET = {
  xs: HERO_HEIGHT.xs,
  md: `calc(${HERO_HEIGHT.md} * 0.85)`,
};

// The character image (1097×823) has empty eye sockets. The eyeballs sit
// underneath it on a light "sclera" patch and are clipped by the sockets.
// Eye coordinates are in the character image's own space.
const CHARACTER_SPACE = { width: 1097, height: 823 };
const EYES = [
  {
    key: 'left',
    src: assetUrl(eyeLeft),
    ball: {
      x: 572, y: 310, width: 41, height: 33,
    },
    sclera: {
      x: 545, y: 304, width: 84, height: 48,
    },
  },
  {
    key: 'right',
    src: assetUrl(eyeRight),
    ball: {
      x: 726, y: 305, width: 37, height: 30,
    },
    sclera: {
      x: 712, y: 300, width: 62, height: 42,
    },
  },
];

const MAX_SHIFT_X = 10; // character-space px the eyeballs can travel horizontally
const MAX_SHIFT_Y = 3; // and vertically (the socket is flat)
const MOUSE_RANGE = 360; // px of cursor distance for a full movement
const EASING = 0.16; // share of the remaining distance covered per frame
const CAP_HEIGHT = 18; // dark cap above each eyeball, hidden under the eyelid

// The eyeball is a half circle whose flat top must stay glued to the upper
// eyelid. A dark cap extends it upward (hidden under the lid) so no gap opens
// when the eye moves down.
const capOf = ({
  x, y, width,
}) => ({
  x: x + 4, y: y - CAP_HEIGHT + 3, width: width - 8, height: CAP_HEIGHT,
});

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

// Absolute position of a rect, in percent of the space it lives in.
const layer = ({
  x, y, width, height,
}, space) => ({
  position: 'absolute',
  left: `${(x / space.width) * 100}%`,
  top: `${(y / space.height) * 100}%`,
  width: `${(width / space.width) * 100}%`,
  height: `${(height / space.height) * 100}%`,
});

/**
 * Hero banner built from the design layers (background, eyeballs, character,
 * logo).
 * - The background always fills the hero; character and logo scale with it.
 * - The logo scales up and down in a 1.5s loop.
 * - The eyeballs follow the mouse cursor. They live under the character
 *   layer, so the empty eye sockets act as the mask. Movement is written to
 *   CSS variables so React never re-renders.
 */
export default function Hero() {
  const { t } = useI18n();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const layout = isDesktop ? LAYOUTS.desktop : LAYOUTS.mobile;
  const stageRef = useRef(null);
  const characterRef = useRef(null);
  const logoRef = useRef(null);
  // Reveal the layers together once all of them are loaded (no stray eyes first).
  const ready = useImagesReady([
    HERO_SOURCES.background,
    HERO_SOURCES.character,
    HERO_SOURCES.logo,
    assetUrl(eyeLeft),
    assetUrl(eyeRight),
  ]);

  // Stop the logo loop while the hero is scrolled out of view.
  useEffect(() => {
    const logoEl = logoRef.current;
    if (!logoEl || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      logoEl.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
    observer.observe(logoEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const body = characterRef.current;
    if (!stage || !body || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let frame = 0;
    const state = Object.fromEntries(EYES.map(({ key }) => [key, {
      x: 0, y: 0, tx: 0, ty: 0,
    }]));

    // Eases every eye toward its target; keeps running only while it moves.
    const tick = () => {
      frame = 0;
      let moving = false;
      EYES.forEach(({ key }) => {
        const eye = state[key];
        eye.x += (eye.tx - eye.x) * EASING;
        eye.y += (eye.ty - eye.y) * EASING;
        if (Math.abs(eye.tx - eye.x) > 0.01 || Math.abs(eye.ty - eye.y) > 0.01) moving = true;
        stage.style.setProperty(`--${key}-x`, `${eye.x}px`);
        stage.style.setProperty(`--${key}-y`, `${eye.y}px`);
      });
      if (moving) frame = requestAnimationFrame(tick);
    };

    const handleMove = (event) => {
      const rect = body.getBoundingClientRect();
      const scale = rect.width / CHARACTER_SPACE.width;
      EYES.forEach(({ key, ball }) => {
        const dx = event.clientX - (rect.left + (ball.x + ball.width / 2) * scale);
        const dy = event.clientY - (rect.top + (ball.y + ball.height / 2) * scale);
        const distance = Math.hypot(dx, dy) || 1;
        const strength = Math.min(distance / MOUSE_RANGE, 1);
        state[key].tx = (dx / distance) * strength * MAX_SHIFT_X * scale;
        state[key].ty = (dy / distance) * strength * MAX_SHIFT_Y * scale;
      });
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(frame);
    };
  }, [isDesktop]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HERO_HEIGHT,
        overflow: 'hidden',
        zIndex: 1,
        // Desktop only: the panel overlaps the hero, so its bottom fades into the backdrop.
        WebkitMaskImage: { xs: 'none', md: FADE_MASK },
        maskImage: { xs: 'none', md: FADE_MASK },
      }}
    >
      <Box
        aria-hidden={ready}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: ready ? 0 : 1,
          visibility: ready ? 'hidden' : 'visible',
          transition: 'opacity 0.4s ease, visibility 0s linear 0.4s',
        }}
      >
        <BrandDots />
      </Box>
      <Box
        ref={stageRef}
        role="img"
        aria-label={t('hero.alt')}
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          height: '100%',
          aspectRatio: `${layout.frame.width} / ${layout.frame.height}`,
          transform: `translateX(-50%) scale(${ready ? 1 : 1.04})`,
          transformOrigin: '50% 40%',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.7s ease 0.1s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <Box ref={characterRef} sx={layer(layout.character, layout.frame)}>
          {EYES.map(({
            key, src, ball, sclera,
          }) => (
            <React.Fragment key={key}>
              <Box
                aria-hidden
                sx={{ ...layer(sclera, CHARACTER_SPACE), bgcolor: '#F4F4F4', borderRadius: '45%' }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translate(var(--${key}-x, 0px), var(--${key}-y, 0px))`,
                  willChange: 'transform',
                }}
              >
                <Box
                  sx={{
                    ...layer(capOf(ball), CHARACTER_SPACE),
                    bgcolor: '#0A0A0A',
                    borderRadius: '30% 30% 0 0',
                  }}
                />
                <Box
                  component="img"
                  src={src}
                  alt=""
                  draggable={false}
                  sx={layer(ball, CHARACTER_SPACE)}
                />
              </Box>
            </React.Fragment>
          ))}
          <Box
            component="img"
            src={HERO_SOURCES.character.src}
            srcSet={HERO_SOURCES.character.srcSet}
            sizes={HERO_SOURCES.character.sizes}
            alt=""
            draggable={false}
            sx={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', userSelect: 'none',
            }}
          />
        </Box>
        <Box
          ref={logoRef}
          component="img"
          src={HERO_SOURCES.logo.src}
          srcSet={HERO_SOURCES.logo.srcSet}
          sizes={HERO_SOURCES.logo.sizes}
          alt=""
          draggable={false}
          sx={{
            ...layer(layout.logo, layout.frame),
            pointerEvents: 'none',
            willChange: 'transform',
            animation: `${pulse} 1.5s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
