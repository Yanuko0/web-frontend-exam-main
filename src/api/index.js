const BASE_URL = '/api/v1';

async function request(path, params, signal) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, value]) => value !== '' && value != null),
  ).toString();
  const response = await fetch(`${BASE_URL}${path}${query ? `?${query}` : ''}`, { signal });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function fetchJobs({
  page, prePage, companyName, educationLevel, salaryLevel,
}, signal) {
  return request('/jobs', {
    page,
    pre_page: prePage,
    company_name: companyName,
    education_level: educationLevel,
    salary_level: salaryLevel,
  }, signal);
}

export function fetchJob(id, signal) {
  return request(`/jobs/${id}`, {}, signal);
}

export function fetchEducationLevels(signal) {
  return request('/educationLevelList', {}, signal);
}

export function fetchSalaryLevels(signal) {
  return request('/salaryLevelList', {}, signal);
}
