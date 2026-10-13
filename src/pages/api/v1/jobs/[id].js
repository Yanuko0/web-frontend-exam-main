import getOnly from '../../../../server/handler';
import { getJob } from '../../../../server/jobs';

// GET /api/v1/jobs/:id
export default getOnly((query) => getJob(query.id), {
  cache: 'public, max-age=60, stale-while-revalidate=300',
});
