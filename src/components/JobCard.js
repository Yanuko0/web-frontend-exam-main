import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { useI18n } from '../i18n';

function InfoRow({ icon, text }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5,
    }}
    >
      {icon}
      <Typography variant="body2" noWrap>{text}</Typography>
    </Box>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

const HOVER_PREFETCH_DELAY_MS = 150;

function JobCard({
  job, educationLabel, salaryLabel, onOpen, onPrefetch,
}) {
  const { t } = useI18n();
  const iconSx = { fontSize: 16 };
  const hoverTimer = useRef(0);

  // Debounced: sweeping the cursor across cards must not prefetch every one.
  const handlePointerEnter = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => onPrefetch(job.id), HOVER_PREFETCH_DELAY_MS);
  };
  const cancelPrefetch = () => clearTimeout(hoverTimer.current);
  useEffect(() => cancelPrefetch, []);

  return (
    <Box
      onClick={() => onOpen(job.id)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={cancelPrefetch}
      onFocus={() => onPrefetch(job.id)}
      onTouchStart={() => onPrefetch(job.id)}
      sx={{
        cursor: 'pointer',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 500, mb: 0.5 }}>{job.companyName}</Typography>
      <InfoRow icon={<PersonOutlineIcon sx={iconSx} />} text={job.jobTitle} />
      <InfoRow icon={<MenuBookOutlinedIcon sx={iconSx} />} text={educationLabel} />
      <InfoRow icon={<CurrencyExchangeIcon sx={iconSx} />} text={salaryLabel} />
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          flexGrow: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {job.preview}
      </Typography>
      <ButtonBase
        sx={{
          alignSelf: 'center',
          mt: 1.5,
          color: 'primary.main',
          fontSize: 12,
          fontWeight: 700,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.2s ease, transform 0.1s ease',
          '&:hover': { bgcolor: 'rgba(238, 141, 43, 0.12)' },
          '&:active': { transform: 'scale(0.96)' },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        {t('card.view')}
      </ButtonBase>
    </Box>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    companyName: PropTypes.string.isRequired,
    jobTitle: PropTypes.string.isRequired,
    preview: PropTypes.string,
  }).isRequired,
  educationLabel: PropTypes.string,
  salaryLabel: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  onPrefetch: PropTypes.func,
};

JobCard.defaultProps = {
  onPrefetch: () => {},
  educationLabel: '',
  salaryLabel: '',
};

export default memo(JobCard);
