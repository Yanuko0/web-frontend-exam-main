import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useI18n } from '../i18n';
import BrandDots from './BrandDots';

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 5;
export const ZOOM_STEP = 0.25;
const DOUBLE_TAP_SCALE = 2;
const SWIPE_DISTANCE = 60; // px needed to change image with a swipe
const INITIAL_VIEW = {
  scale: 1, rotate: 0, x: 0, y: 0,
};

export const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const iconButtonSx = {
  color: '#fff',
  bgcolor: 'rgba(255, 255, 255, 0.12)',
  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
  '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' },
};

function ToolButton({
  label, onClick, disabled, children,
}) {
  return (
    <Tooltip title={label} enterDelay={600}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' } }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

ToolButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

ToolButton.defaultProps = {
  disabled: false,
};

/**
 * Full-screen image viewer (in the spirit of Ant Design's Image preview):
 * zoom (buttons, wheel, pinch, double click/tap), rotate, drag to pan, swipe or
 * arrows to switch images, keyboard shortcuts, and close by button, Esc or
 * clicking the backdrop. Works with mouse and touch.
 */
export default function ImagePreview({
  images, index, open, onClose, onIndexChange,
}) {
  const { t } = useI18n();
  const [view, setView] = useState(INITIAL_VIEW);
  const [status, setStatus] = useState('loading');
  const [interacting, setInteracting] = useState(false);
  const pointers = useRef(new Map());
  const gesture = useRef({
    startDistance: 0, startScale: 1, startX: 0, startY: 0, originX: 0, originY: 0, moved: false,
  });
  const count = images.length;

  const reset = useCallback(() => setView(INITIAL_VIEW), []);

  const zoomTo = useCallback((next) => {
    setView((prev) => {
      const scale = clampScale(next);
      // Back at (or below) fit size: re-center the image.
      return scale <= 1 ? {
        ...prev, scale, x: 0, y: 0,
      } : { ...prev, scale };
    });
  }, []);

  const go = useCallback((direction) => {
    if (count < 2) return;
    onIndexChange((index + direction + count) % count);
  }, [count, index, onIndexChange]);

  // A new image always starts fitted and unrotated.
  useEffect(() => {
    setView(INITIAL_VIEW);
    setStatus('loading');
  }, [index, open]);

  const handleKeyDown = (event) => {
    const handlers = {
      ArrowLeft: () => go(-1),
      ArrowRight: () => go(1),
      '+': () => zoomTo(view.scale + ZOOM_STEP),
      '=': () => zoomTo(view.scale + ZOOM_STEP),
      '-': () => zoomTo(view.scale - ZOOM_STEP),
      0: reset,
    };
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  const handleWheel = (event) => {
    zoomTo(view.scale + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setInteracting(true);
    const points = [...pointers.current.values()];
    gesture.current = {
      ...gesture.current,
      startDistance: points.length === 2 ? distance(points[0], points[1]) : 0,
      startScale: view.scale,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const g = gesture.current;

    if (points.length === 2 && g.startDistance) {
      // Pinch to zoom.
      g.moved = true;
      const scale = clampScale(g.startScale * (distance(points[0], points[1]) / g.startDistance));
      setView((prev) => ({ ...prev, scale }));
      return;
    }

    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) g.moved = true;
    setView((prev) => (prev.scale > 1
      ? { ...prev, x: g.originX + dx, y: g.originY + dy }
      // At fit size the image follows the finger horizontally, then swipes away.
      : { ...prev, x: dx * 0.6, y: 0 }));
  };

  const handlePointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) return;
    setInteracting(false);
    const dx = event.clientX - gesture.current.startX;
    if (view.scale <= 1 && Math.abs(dx) > SWIPE_DISTANCE) {
      setView((prev) => ({ ...prev, x: 0 }));
      go(dx < 0 ? 1 : -1);
      return;
    }
    setView((prev) => (prev.scale <= 1 ? {
      ...prev, scale: Math.max(prev.scale, MIN_SCALE), x: 0, y: 0,
    } : prev));
  };

  const handleDoubleClick = () => {
    if (view.scale > 1) reset();
    else zoomTo(DOUBLE_TAP_SCALE);
  };

  const zoomedIn = view.scale > 1;
  let cursor = 'zoom-in';
  if (zoomedIn) cursor = interacting ? 'grabbing' : 'grab';
  const atMin = view.scale <= MIN_SCALE;
  const atMax = view.scale >= MAX_SCALE;
  const src = images[index];

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition={false}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0, 0, 0, 0.88)' } } }}
    >
      <Box
        role="dialog"
        aria-modal="true"
        aria-label={t('preview.title')}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        sx={{
          position: 'fixed',
          inset: 0,
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          touchAction: 'none',
        }}
      >
        {/* Clicking the empty area around the image closes the preview. */}
        <Box
          role="presentation"
          onClick={onClose}
          onWheel={handleWheel}
          sx={{ position: 'absolute', inset: 0 }}
        />

        {status === 'loading' && (
          <Box sx={{ position: 'absolute', zIndex: 1 }}><BrandDots /></Box>
        )}
        {status === 'error' && (
          <Box sx={{
            position: 'absolute', zIndex: 1, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center',
          }}
          >
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 48 }} />
            <Typography variant="body2">{t('preview.error')}</Typography>
          </Box>
        )}

        <Box
          component="img"
          key={src}
          src={src}
          alt={t('carousel.alt', { n: index + 1 })}
          draggable={false}
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          sx={{
            position: 'relative',
            maxWidth: '92vw',
            maxHeight: '78vh',
            minWidth: { xs: '60vw', md: 360 },
            objectFit: 'contain',
            borderRadius: 1,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            cursor,
            userSelect: 'none',
            touchAction: 'none',
            opacity: status === 'loaded' ? 1 : 0,
            transform: `translate(${view.x}px, ${view.y}px) rotate(${view.rotate}deg) scale(${view.scale})`,
            transition: interacting ? 'opacity 0.3s ease' : 'transform 0.25s ease, opacity 0.3s ease',
          }}
        />

        <IconButton
          aria-label={t('preview.close')}
          onClick={onClose}
          sx={{
            ...iconButtonSx, position: 'absolute', top: 16, right: 16,
          }}
        >
          <CloseIcon />
        </IconButton>

        {count > 1 && (
          <Typography
            sx={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: 14,
              px: 1.5,
              py: 0.25,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
            }}
          >
            {t('carousel.counter', { current: index + 1, total: count })}
          </Typography>
        )}

        {count > 1 && (
          <>
            <IconButton
              aria-label={t('preview.prev')}
              onClick={() => go(-1)}
              sx={{
                ...iconButtonSx, position: 'absolute', left: { xs: 8, md: 24 }, top: '50%', transform: 'translateY(-50%)',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label={t('preview.next')}
              onClick={() => go(1)}
              sx={{
                ...iconButtonSx, position: 'absolute', right: { xs: 8, md: 24 }, top: '50%', transform: 'translateY(-50%)',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        <Box
          role="toolbar"
          aria-label={t('preview.title')}
          sx={{
            position: 'absolute',
            bottom: { xs: 24, md: 32 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0, md: 0.5 },
            px: 1,
            py: 0.5,
            borderRadius: 6,
            bgcolor: 'rgba(30, 30, 30, 0.85)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <ToolButton
            label={t('preview.rotateLeft')}
            onClick={() => setView((prev) => ({ ...prev, rotate: prev.rotate - 90 }))}
          >
            <RotateLeftIcon />
          </ToolButton>
          <ToolButton
            label={t('preview.rotateRight')}
            onClick={() => setView((prev) => ({ ...prev, rotate: prev.rotate + 90 }))}
          >
            <RotateRightIcon />
          </ToolButton>
          <ToolButton
            label={t('preview.zoomOut')}
            onClick={() => zoomTo(view.scale - ZOOM_STEP)}
            disabled={atMin}
          >
            <ZoomOutIcon />
          </ToolButton>
          <Typography
            aria-live="polite"
            sx={{
              color: '#fff', fontSize: 13, minWidth: 44, textAlign: 'center',
            }}
          >
            {`${Math.round(view.scale * 100)}%`}
          </Typography>
          <ToolButton
            label={t('preview.zoomIn')}
            onClick={() => zoomTo(view.scale + ZOOM_STEP)}
            disabled={atMax}
          >
            <ZoomInIcon />
          </ToolButton>
          <ToolButton label={t('preview.reset')} onClick={reset}>
            <RestartAltIcon />
          </ToolButton>
        </Box>
      </Box>
    </Modal>
  );
}

ImagePreview.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  index: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onIndexChange: PropTypes.func.isRequired,
};
