import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useI18n } from '../i18n';
import CarouselImage from './CarouselImage';
import ImagePreview from './ImagePreview';

const AUTO_PLAY_MS = 3500;
const SWIPE_DISTANCE = 40; // px
const SLIDE_GAP = 12; // px
const MOBILE_SLIDE_WIDTH = 72; // % of the stage; the neighbours peek on both sides
const DESKTOP_VISIBLE = 3; // photos shown side by side on desktop (as in the Figma popup)
const SLIDE_RATIO = 3 / 5; // photo height / width
// Mobile stage aspect ratio (width : height) so the centred photo keeps 5:3.
const MOBILE_STAGE_RATIO = `1 / ${(MOBILE_SLIDE_WIDTH / 100) * SLIDE_RATIO}`;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Signed distance (in slides) from the active slide, wrapped so that the
 * carousel is circular: the neighbours of the first slide are the last and the
 * second, and so on. Every step moves exactly one slide.
 */
export function slideOffset(index, active, count) {
  if (count === 2) return index === active ? 0 : 1;
  const half = Math.floor(count / 2);
  return ((index - active + count + half) % count) - half;
}

/**
 * First photo of the desktop window: it only slides once the selection would
 * leave the window, so the last photos are walked through one by one.
 */
export function windowStartFor(active, count, visible = DESKTOP_VISIBLE) {
  return Math.min(active, Math.max(count - visible, 0));
}

/**
 * Photo carousel; arrows, dots, swipe/drag, keyboard and auto-play all move
 * the selection exactly one photo at a time, and past the last photo it wraps
 * to the first. Clicking the selected photo opens the zoomable preview.
 * - Mobile: the selected photo is centred, its neighbours peek in on both sides.
 * - Desktop (Figma): three photos side by side, left aligned. The strip only
 *   slides when the selection would leave the window, so the highlighted photo
 *   (and the active dot) walk through the last photos instead of jumping.
 */
function ImageCarousel({ images }) {
  const { t } = useI18n();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const count = images.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const drag = useRef({ startX: 0, active: false, moved: false });

  const step = useCallback(
    (direction) => setActive((value) => (value + direction + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || previewOpen || count < 2) return undefined;
    const timer = setInterval(() => step(1), AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, previewOpen, count, step]);

  const handlePointerDown = (event) => {
    drag.current = { startX: event.clientX, active: true, moved: false };
    setPaused(true);
  };
  const handlePointerMove = (event) => {
    if (!drag.current.active) return;
    if (Math.abs(event.clientX - drag.current.startX) > 6) drag.current.moved = true;
  };
  const endDrag = (event) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    drag.current.active = false;
    setPaused(false);
    if (Math.abs(dx) > SWIPE_DISTANCE) step(dx < 0 ? 1 : -1);
  };

  const handleSlideClick = (index) => {
    // A swipe must not be treated as a click on the slide under the finger.
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (index === active) {
      setPreviewIndex(index);
      setPreviewOpen(true);
    } else {
      setActive(index);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  // First photo of the visible window on desktop.
  const windowStart = windowStartFor(active, count);

  const arrowSx = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: { xs: 2, md: 6 },
    transform: 'translateY(-50%)',
    zIndex: 3,
    color: 'text.primary',
    bgcolor: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.3)',
    '&:hover': { bgcolor: '#fff' },
  });

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={t('carousel.label')}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{ position: 'relative' }}
    >
      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          // Mobile: the stage height follows the centred photo; desktop: the strip decides.
          aspectRatio: isDesktop ? 'auto' : MOBILE_STAGE_RATIO,
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        <Box
          sx={isDesktop ? {
            display: 'flex',
            gap: `${SLIDE_GAP}px`,
            transform: `translateX(calc(${-windowStart} * (100% + ${SLIDE_GAP}px) / ${DESKTOP_VISIBLE}))`,
            transition: `transform 0.5s ${EASE}`,
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          } : { position: 'absolute', inset: 0 }}
        >
          {images.map((src, index) => {
            const isActive = index === active;
            let slideLayout;
            if (isDesktop) {
              const inWindow = index >= windowStart && index < windowStart + DESKTOP_VISIBLE;
              slideLayout = {
                flex: `0 0 calc((100% - ${(DESKTOP_VISIBLE - 1) * SLIDE_GAP}px) / ${DESKTOP_VISIBLE})`,
                aspectRatio: '5 / 3',
                opacity: isActive ? 1 : 0.6,
                visibility: inWindow ? 'visible' : 'hidden',
                outline: isActive ? '2px solid' : '2px solid transparent',
                outlineColor: isActive ? 'primary.main' : 'transparent',
                outlineOffset: -2,
                zIndex: 1,
                transition: 'opacity 0.3s ease, outline-color 0.3s ease',
              };
            } else {
              const offset = slideOffset(index, active, count);
              const visible = Math.abs(offset) <= 1;
              const neighbourOpacity = visible ? 0.55 : 0;
              slideLayout = {
                position: 'absolute',
                top: 0,
                left: '50%',
                width: `${MOBILE_SLIDE_WIDTH}%`,
                height: '100%',
                transform: `translateX(calc(-50% + ${offset} * (100% + ${SLIDE_GAP}px))) scale(${isActive ? 1 : 0.86})`,
                opacity: isActive ? 1 : neighbourOpacity,
                visibility: visible ? 'visible' : 'hidden',
                zIndex: isActive ? 2 : 1,
                transition: `transform 0.5s ${EASE}, opacity 0.4s ease, visibility 0s linear ${visible ? '0s' : '0.5s'}`,
              };
            }
            const focusable = isDesktop
              ? index >= windowStart && index < windowStart + DESKTOP_VISIBLE
              : Math.abs(slideOffset(index, active, count)) <= 1;
            return (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={`${src}-${index}`}
                component="button"
                type="button"
                aria-label={isActive ? t('carousel.open', { n: index + 1 }) : t('carousel.goto', { n: index + 1 })}
                aria-current={isActive}
                tabIndex={focusable ? 0 : -1}
                onClick={() => handleSlideClick(index)}
                sx={{
                  p: 0,
                  border: 0,
                  bgcolor: 'transparent',
                  cursor: isActive ? 'zoom-in' : 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  ...slideLayout,
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
                  '&:hover .zoom-hint, &:focus-visible .zoom-hint': { opacity: 1 },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              >
                <CarouselImage src={src} index={index} priority={!isDesktop || focusable} />
                {isActive && (
                  <Box
                    className="zoom-hint"
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      display: 'flex',
                      p: 0.5,
                      borderRadius: '50%',
                      color: '#fff',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      opacity: { xs: 0.85, md: 0 },
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        {count > 1 && (
          <>
            <IconButton size="small" aria-label={t('carousel.prev')} onClick={() => step(-1)} sx={arrowSx('left')}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label={t('carousel.next')} onClick={() => step(1)} sx={arrowSx('right')}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 1,
      }}
      >
        {images.map((src, index) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={`dot-${index}`}
            component="button"
            type="button"
            aria-label={t('carousel.goto', { n: index + 1 })}
            aria-current={index === active}
            onClick={() => setActive(index)}
            sx={{
              p: 0,
              border: 0,
              cursor: 'pointer',
              bgcolor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              height: 16,
              '&::before': {
                content: '""',
                display: 'block',
                height: 4,
                width: index === active ? 24 : 12,
                borderRadius: 2,
                bgcolor: index === active ? 'primary.main' : 'grey.300',
                transition: 'width 0.3s ease, background-color 0.3s ease',
              },
              '&:hover::before': { bgcolor: index === active ? 'primary.main' : 'grey.500' },
            }}
          />
        ))}
      </Box>

      <ImagePreview
        images={images}
        index={previewIndex}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setActive(previewIndex); // the carousel follows the photo last viewed
        }}
        onIndexChange={setPreviewIndex}
      />
    </Box>
  );
}

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default memo(ImageCarousel);
