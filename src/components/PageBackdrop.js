import React from 'react';
import Box from '@mui/material/Box';
import background from '../assets/hero-bg.webp';
import assetUrl from '../utils/asset';

/**
 * Soft, blurred extension of the hero background. It fills the whole page
 * behind the content so wide screens never show blank side margins, and the
 * sharp hero fades into it.
 */
export default function PageBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -60,
          backgroundImage: `url(${assetUrl(background)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(28px) saturate(0.9)',
        },
        // Lightens the blur so the white content panel stays the focus.
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.55))',
        },
      }}
    />
  );
}
