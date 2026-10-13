import { useEffect, useState } from 'react';
import { fetchJob } from '../api';

// Job details already fetched (or prefetched), keyed by id, plus requests in flight.
const cache = new Map();
const pending = new Map();

function preloadImages(urls = []) {
  urls.forEach((url) => {
    const image = new Image();
    image.src = url;
  });
}

// Fetches a job once: concurrent callers share the same request.
function loadJob(id) {
  if (pending.has(id)) return pending.get(id);
  const request = fetchJob(id)
    .then((job) => {
      cache.set(id, job);
      preloadImages(job.companyPhoto);
      return job;
    })
    .finally(() => pending.delete(id));
  pending.set(id, request);
  return request;
}

/**
 * Warms the cache for a job (e.g. on hover) so opening its details feels
 * instant: fetches the detail and starts downloading its photos.
 */
export function prefetchJob(id) {
  if (cache.has(id)) return;
  loadJob(id).catch(() => {});
}

export default function useJob(id) {
  const [state, setState] = useState({ job: null, loading: false });

  useEffect(() => {
    if (!id) {
      setState({ job: null, loading: false });
      return undefined;
    }
    if (cache.has(id)) {
      setState({ job: cache.get(id), loading: false });
      return undefined;
    }
    let cancelled = false;
    setState({ job: null, loading: true });
    loadJob(id)
      .then((job) => {
        if (!cancelled) setState({ job, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ job: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
