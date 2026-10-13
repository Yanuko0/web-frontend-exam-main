import getOnly from '../../../server/handler';
import { salaryLevels } from '../../../server/jobs';

// GET /api/v1/salaryLevelList
export default getOnly(() => salaryLevels, {
  cache: 'public, max-age=3600, stale-while-revalidate=86400',
});
