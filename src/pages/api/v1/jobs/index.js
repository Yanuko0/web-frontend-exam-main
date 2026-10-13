import getOnly from '../../../../server/handler';
import { listJobs } from '../../../../server/jobs';

// GET /api/v1/jobs?pre_page&page&company_name&education_level&salary_level
export default getOnly((query) => listJobs({
  companyName: query.company_name,
  educationLevel: query.education_level,
  salaryLevel: query.salary_level,
  page: query.page,
  prePage: query.pre_page,
}), { cache: 'public, max-age=30, stale-while-revalidate=120' });
