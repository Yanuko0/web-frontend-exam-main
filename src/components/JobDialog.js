import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import useJob from '../hooks/useJob';
import { isSafeImageUrl, sanitizeHtml } from '../utils/sanitize';
import ImageCarousel from './ImageCarousel';
import { useI18n } from '../i18n';

const descriptionSx = {
  fontSize: 13,
  lineHeight: 1.8,
  '& h1, & h2': {
    fontSize: 13, fontWeight: 400, m: 0, mt: 1,
  },
  '& ul': { m: 0, pl: 2 },
  '& p': { m: 0, mt: 1 },
  '& a': { color: 'primary.main' },
};

export default function JobDialog({ jobId, onClose }) {
  const { t } = useI18n();
  const { job, loading } = useJob(jobId);
  const photos = useMemo(
    () => (job?.companyPhoto ?? []).filter(isSafeImageUrl),
    [job],
  );
  const html = useMemo(
    () => (job ? sanitizeHtml(job.description) : ''),
    [job],
  );

  return (
    <Dialog
      open={Boolean(jobId)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      TransitionComponent={Grow}
      transitionDuration={{ enter: 280, exit: 160 }}
      aria-labelledby="job-dialog-title"
    >
      <DialogTitle
        id="job-dialog-title"
        sx={{
          fontSize: 16, fontWeight: 700, borderBottom: '1px solid', borderColor: 'grey.100',
        }}
      >
        {t('dialog.title')}
      </DialogTitle>
      <DialogContent sx={{ minHeight: 280 }}>
        {loading && (
          <Box sx={{ pt: 2 }} aria-busy aria-label={t('dialog.loading')}>
            <Skeleton width="40%" height={28} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2].map((item) => (
                <Skeleton
                  key={item}
                  variant="rounded"
                  animation="wave"
                  sx={{ flex: 1, height: 'auto', aspectRatio: '5 / 3' }}
                />
              ))}
            </Box>
            <Skeleton width="20%" height={24} sx={{ mt: 2 }} />
            {[100, 92, 96, 70].map((width) => (
              <Skeleton key={width} width={`${width}%`} height={18} />
            ))}
          </Box>
        )}
        {!loading && !job && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {t('dialog.error')}
          </Typography>
        )}
        {job && (
          <Box sx={{ pt: 2 }}>
            {/* Figma title row: width fills the popup (702 on desktop), height 30, gap 8.
                On mobile the job title wraps onto its own line. */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'flex-start',
                gap: 1,
                minHeight: 30,
                mb: 1.5,
              }}
            >
              <Typography component="h2" sx={{ fontWeight: 500, lineHeight: '30px' }}>
                {job.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {job.jobTitle}
              </Typography>
            </Box>
            {photos.length > 0 && <ImageCarousel images={photos} />}
            <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>{t('dialog.content')}</Typography>
            <Box
              sx={descriptionSx}
              // Sanitized with DOMPurify above.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'grey.100' }}>
        <Button
          variant="contained"
          disableElevation
          onClick={onClose}
          // Figma: background #4D4D4D (grey.800).
          sx={{
            bgcolor: 'grey.800',
            color: '#fff',
            px: 3,
            '&:hover': { bgcolor: 'grey.900' },
          }}
        >
          {t('dialog.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

JobDialog.propTypes = {
  jobId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

JobDialog.defaultProps = {
  jobId: null,
};
