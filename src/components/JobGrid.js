import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import JobCard from './JobCard';
import RegionLoader from './RegionLoader';
import { useI18n } from '../i18n';

const optionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
  gap: 2,
};

function JobGrid({
  jobs, loading, loaded, error, pageSize, educationLevels, salaryLevels,
  hasFilters, onOpen, onPrefetch, onRetry, onClear,
}) {
  const { t } = useI18n();
  // id → label lookups, rebuilt only when the option lists change.
  const educationLabels = useMemo(
    () => new Map(educationLevels.map(({ id, label }) => [id, label])),
    [educationLevels],
  );
  const salaryLabels = useMemo(
    () => new Map(salaryLevels.map(({ id, label }) => [id, label])),
    [salaryLevels],
  );

  if (!loaded) {
    return (
      <Box sx={gridSx} data-testid="job-skeleton">
        {Array.from({ length: pageSize }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={index} variant="rounded" height={170} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <Typography variant="body2" color="text.secondary">{t('grid.error')}</Typography>
        <Button variant="outlined" size="small" onClick={onRetry}>{t('grid.retry')}</Button>
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box sx={{
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <Typography variant="caption" color="text.disabled">{t('grid.empty')}</Typography>
        {hasFilters && (
          <Button size="small" onClick={onClear}>{t('grid.clearFilters')}</Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <RegionLoader active={loading} label={t('grid.loading')} />
      <Box
        sx={{
          ...gridSx,
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
        }}
        aria-busy={loading}
      >
        {jobs.map((job, index) => (
          <Fade key={job.id} in timeout={300 + index * 80}>
            <Box>
              <JobCard
                job={job}
                educationLabel={educationLabels.get(String(job.educationId)) ?? ''}
                salaryLabel={salaryLabels.get(String(job.salaryId)) ?? ''}
                onOpen={onOpen}
                onPrefetch={onPrefetch}
              />
            </Box>
          </Fade>
        ))}
      </Box>
    </Box>
  );
}

JobGrid.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired })).isRequired,
  loading: PropTypes.bool.isRequired,
  loaded: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  pageSize: PropTypes.number.isRequired,
  educationLevels: PropTypes.arrayOf(optionShape).isRequired,
  salaryLevels: PropTypes.arrayOf(optionShape).isRequired,
  hasFilters: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onPrefetch: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default memo(JobGrid);
