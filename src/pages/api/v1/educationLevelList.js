import getOnly from '../../../server/handler';
import { educationLevels } from '../../../server/jobs';

// GET /api/v1/educationLevelList
export default getOnly(() => educationLevels, {
  cache: 'public, max-age=3600, stale-while-revalidate=86400',
});
