import jobList from './data/jobList';
import educationList from './data/educationList';
import salaryList from './data/salaryList';

// The data lives only on the server; the browser can reach it through the API.
const jobs = jobList.map((job, index) => ({ id: String(index + 1), ...job }));

export const educationLevels = educationList.map(({ id, label }) => ({ id: String(id), label }));
export const salaryLevels = salaryList.map(({ id, label }) => ({ id: String(id), label }));

// Upper bounds keep a single request cheap (50 jobs in total, so 100 per page is plenty).
export const MAX_PAGE_SIZE = 100;
export const MAX_COMPANY_NAME_LENGTH = 50;

const toPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

/**
 * Filters (company name contains, education / salary equals) and, when both
 * `page` and `prePage` are valid, paginates. The list view omits the heavy
 * `companyPhoto` and `description` fields.
 */
export function listJobs({
  companyName, educationLevel, salaryLevel, page, prePage,
}) {
  const education = toPositiveInteger(educationLevel);
  const salary = toPositiveInteger(salaryLevel);
  const pageNumber = toPositiveInteger(page);
  const pageSize = Math.min(toPositiveInteger(prePage) ?? 0, MAX_PAGE_SIZE) || null;
  const name = String(companyName ?? '').trim().slice(0, MAX_COMPANY_NAME_LENGTH);

  const matches = jobs.filter((job) => (
    (!name || job.companyName.includes(name))
    && (!education || job.educationId === education)
    && (!salary || job.salaryId === salary)
  ));

  const start = pageNumber && pageSize ? (pageNumber - 1) * pageSize : 0;
  const visible = pageNumber && pageSize ? matches.slice(start, start + pageSize) : matches;

  return {
    data: visible.map(({ companyPhoto, description, ...summary }) => summary),
    total: matches.length,
  };
}

/** A single job for the detail popup (without the list-only fields). */
export function getJob(id) {
  const job = jobs.find((item) => item.id === String(id));
  if (!job) return null;
  const {
    preview, educationId, salaryId, ...detail
  } = job;
  return detail;
}
