import React, {
  Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CssBaseline from '@mui/material/CssBaseline';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider, keyframes } from '@mui/material/styles';
import FilterBar from './components/FilterBar';
import Hero, { PANEL_OFFSET } from './components/Hero';
import JobGrid from './components/JobGrid';
import PageBackdrop from './components/PageBackdrop';
import { prefetchJob } from './hooks/useJob';
import useJobs from './hooks/useJobs';
import useOptions from './hooks/useOptions';
import { localizeOptions, useI18n } from './i18n';
import theme from './theme';

// The panel eases up into place when the page appears.
const panelIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const JobDialog = lazy(() => import('./components/JobDialog'));

const EMPTY_FILTERS = { companyName: '', educationLevel: '', salaryLevel: '' };
const DESKTOP_PAGE_SIZE = 6;
const MOBILE_PAGE_SIZE = 4;

function App() {
  const { t } = useI18n();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pageSize = isDesktop ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterKey, setFilterKey] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const options = useOptions();
  const educationLevels = useMemo(
    () => localizeOptions(options.educationLevels, 'education', t),
    [options.educationLevels, t],
  );
  const salaryLevels = useMemo(
    () => localizeOptions(options.salaryLevels, 'salary', t),
    [options.salaryLevels, t],
  );
  const listRef = useRef(null);
  const {
    jobs, total, loading, loaded, error, retry,
  } = useJobs({ page, prePage: pageSize, filters });

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const hasFilters = Boolean(
    filters.companyName || filters.educationLevel || filters.salaryLevel,
  );

  const handlePageChange = useCallback((_, value) => {
    setPage(value);
    // Only scroll when the list top is out of view, so the page doesn't jump needlessly.
    const top = listRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.6) {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSearch = useCallback((nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setFilterKey((value) => value + 1); // remounts FilterBar so its inputs reset
  }, []);

  const handleOpen = useCallback((id) => setSelectedJobId(id), []);
  const handleClose = useCallback(() => setSelectedJobId(null), []);

  // Page boundaries differ per breakpoint, so start over when the page size changes.
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Link
        href="#job-list"
        sx={{
          position: 'absolute',
          left: 8,
          top: -48,
          zIndex: 10,
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          '&:focus': { top: 8 },
        }}
      >
        {t('app.skip')}
      </Link>
      <Box className="main" sx={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
        <PageBackdrop />
        <Hero />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            pt: PANEL_OFFSET,
            px: { xs: 0, md: '30px' },
            pb: { xs: 0, md: 6 },
          }}
        >
          <Box
            component="main"
            id="job-list"
            ref={listRef}
            sx={{
              maxWidth: 1380,
              mx: 'auto',
              bgcolor: 'background.paper',
              borderRadius: { xs: 0, md: 2 },
              boxShadow: { xs: '0 -2px 8px rgba(0, 0, 0, 0.08)', md: '0 2px 12px rgba(0, 0, 0, 0.12)' },
              animation: `${panelIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              p: { xs: 2, md: 3 },
            }}
          >
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: { xs: 1, md: 2 },
              mb: 2,
            }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  pl: 1,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  lineHeight: 1.3,
                  flex: { xs: '1 1 100%', md: '0 1 auto' },
                }}
              >
                {t('app.heading')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                role="status"
                aria-live="polite"
                sx={{ whiteSpace: 'nowrap' }}
              >
                {loaded && !error ? t('app.count', { count: total }) : ''}
              </Typography>
            </Box>
            {isDesktop && (
              <FilterBar
                key={filterKey}
                initialFilters={filters}
                educationLevels={educationLevels}
                salaryLevels={salaryLevels}
                onSearch={handleSearch}
              />
            )}
            <JobGrid
              jobs={jobs}
              loading={loading}
              loaded={loaded}
              error={error}
              onRetry={retry}
              hasFilters={hasFilters}
              onClear={handleClear}
              pageSize={pageSize}
              educationLevels={educationLevels}
              salaryLevels={salaryLevels}
              onOpen={handleOpen}
              onPrefetch={prefetchJob}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                size="small"
                color="primary"
                siblingCount={isDesktop ? 2 : 0}
                boundaryCount={1}
                getItemAriaLabel={(type, itemPage, selected) => {
                  if (type === 'page') {
                    return t(selected ? 'pagination.current' : 'pagination.page', { n: itemPage });
                  }
                  return t(`pagination.${type}`);
                }}
              />
            </Box>
          </Box>
        </Box>
        {selectedJobId && (
          <Suspense fallback={null}>
            <JobDialog jobId={selectedJobId} onClose={handleClose} />
          </Suspense>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
