import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { useI18n } from '../i18n';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0) scale(0.7); opacity: 0.45; }
  40% { transform: translateY(-10px) scale(1); opacity: 1; }
`;

const COLORS = ['#EE8D2B', '#D95B48', '#EE8D2B'];

/** Three bouncing dots in the brand colors; small, calm and easy on the eyes. */
export default function BrandDots({ label }) {
  const { t } = useI18n();
  return (
    <Box
      role="status"
      aria-label={label || t('dialog.loading')}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1, height: 24,
      }}
    >
      {COLORS.map((color, index) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: color,
            animation: `${bounce} 1s ease-in-out ${index * 0.15}s infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.8 },
          }}
        />
      ))}
    </Box>
  );
}

BrandDots.propTypes = {
  label: PropTypes.string,
};

BrandDots.defaultProps = {
  label: '',
};
