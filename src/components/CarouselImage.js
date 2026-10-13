import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import { useI18n } from '../i18n';

const tileSx = {
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: 1,
  overflow: 'hidden',
  bgcolor: 'grey.100',
};

/**
 * One carousel photo. A shimmering placeholder keeps the layout stable while
 * the image loads, then the photo fades in. A failed image shows a muted icon.
 */
function CarouselImage({ src, index, priority }) {
  const { t } = useI18n();
  const [status, setStatus] = useState('loading');

  return (
    <Box sx={tileSx}>
      {status === 'loading' && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: 'absolute', inset: 0, height: '100%' }}
        />
      )}
      {status === 'error' && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.500',
        }}
        >
          <ImageNotSupportedOutlinedIcon />
        </Box>
      )}
      <Box
        component="img"
        src={src}
        alt={t('carousel.alt', { n: index + 1 })}
        width={250}
        height={150}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
    </Box>
  );
}

CarouselImage.propTypes = {
  src: PropTypes.string.isRequired,
  index: PropTypes.number,
  priority: PropTypes.bool,
};

CarouselImage.defaultProps = {
  index: 0,
  priority: false,
};

export default memo(CarouselImage);
