import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { fetchJobs } from '../api';

const PREFETCH_DELAY_MS = 400;

/**
 * Loads a page of jobs. Previous results stay on screen while the next page
 * loads (no flash of empty content), visited pages are cached per query and
 * superseded requests are aborted.
 */
export default function useJobs({
  page, prePage, filters,
}) {
  const [state, setState] = useState({
    jobs: [], total: 0, loading: true, loaded: false, error: false,
  });
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map());
  const { companyName, educationLevel, salaryLevel } = filters;

  useEffect(() => {
    const query = {
      prePage, companyName, educationLevel, salaryLevel,
    };
    const keyOf = (pageNumber) => JSON.stringify([pageNumber, ...Object.values(query)]);
    const key = keyOf(page);

    // Quietly warms the cache with the next page once the current one is shown.
    const prefetchNext = (total) => {
      if (page * prePage >= total || cache.current.has(keyOf(page + 1))) return undefined;
      return setTimeout(() => {
        fetchJobs({ ...query, page: page + 1 })
          .then((next) => {
            cache.current.set(keyOf(page + 1), { jobs: next.data, total: next.total });
          })
          .catch(() => {});
      }, PREFETCH_DELAY_MS);
    };

    let prefetchTimer;
    const cached = cache.current.get(key);
    if (cached) {
      setState({
        ...cached, loading: false, loaded: true, error: false,
      });
      prefetchTimer = prefetchNext(cached.total);
      return () => clearTimeout(prefetchTimer);
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: false }));
    fetchJobs({ ...query, page }, controller.signal)
      .then(({ data, total }) => {
        cache.current.set(key, { jobs: data, total });
        setState({
          jobs: data, total, loading: false, loaded: true, error: false,
        });
        prefetchTimer = prefetchNext(total);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((prev) => ({
          ...prev, loading: false, loaded: true, error: true,
        }));
      });
    return () => {
      controller.abort();
      clearTimeout(prefetchTimer);
    };
  }, [page, prePage, companyName, educationLevel, salaryLevel, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}
