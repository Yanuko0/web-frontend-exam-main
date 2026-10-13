import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import useDelayedFlag from '../hooks/useDelayedFlag';
import BrandDots from './BrandDots';

/**
 * Local loading indicator laid over its (relatively positioned) parent. It
 * only appears if loading lasts longer than a moment, so quick responses
 * never flash a loader.
 */
export default function RegionLoader({ active, label }) {
  const visible = useDelayedFlag(active);

  return (
    <Fade in={visible} timeout={{ enter: 200, exit: 150 }} unmountOnExit>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 8, md: 12 },
          pointerEvents: 'none',
        }}
      >
        <Box sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        }}
        >
          <BrandDots label={label} />
        </Box>
      </Box>
    </Fade>
  );
}

RegionLoader.propTypes = {
  active: PropTypes.bool.isRequired,
  label: PropTypes.string,
};

RegionLoader.defaultProps = {
  label: '',
};
