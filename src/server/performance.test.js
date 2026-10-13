import { getJob, listJobs } from './jobs';
import { createRateLimiter } from './rateLimit';
import { sanitizeHtml } from '../utils/sanitize';

// Generous budgets (a CI box can be slow); they exist to catch accidental
// algorithmic regressions, e.g. an O(n²) filter or re-parsing on every call.
// Best of three runs: machine load (other test workers) only ever makes a run
// slower, so the fastest run is the fairest measure of the code itself.
const time = (fn) => Math.min(...[0, 1, 2].map(() => {
  const start = performance.now();
  fn();
  return performance.now() - start;
}));

describe('performance budgets', () => {
  it('lists, filters and paginates 2,000 requests within 400ms', () => {
    const elapsed = time(() => {
      for (let i = 0; i < 2000; i += 1) {
        listJobs({
          companyName: i % 2 ? '科技' : '',
          educationLevel: String(i % 6),
          page: '1',
          prePage: '6',
        });
      }
    });
    expect(elapsed).toBeLessThan(400);
  });

  it('looks up 5,000 jobs by id within 250ms', () => {
    const elapsed = time(() => {
      for (let i = 0; i < 5000; i += 1) getJob(String((i % 50) + 1));
    });
    expect(elapsed).toBeLessThan(250);
  });

  it('rate limits 100,000 checks within 400ms', () => {
    const check = createRateLimiter({ limit: 1e9 });
    const elapsed = time(() => {
      for (let i = 0; i < 100000; i += 1) check(`client-${i % 200}`);
    });
    expect(elapsed).toBeLessThan(400);
  });

  it('sanitizes a full job description 100 times within 1.5s', () => {
    const { description } = getJob('1');
    const elapsed = time(() => {
      for (let i = 0; i < 100; i += 1) sanitizeHtml(description);
    });
    expect(elapsed).toBeLessThan(1500);
  });
});
