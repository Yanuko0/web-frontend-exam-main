import { fetchJobs } from './index';

describe('fetchJobs', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], total: 0 }),
    });
  });

  it('maps params to the API query and drops empty values', async () => {
    await fetchJobs({
      page: 2, prePage: 6, companyName: '立刻', educationLevel: '', salaryLevel: '3',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/jobs?page=2&pre_page=6&company_name=%E7%AB%8B%E5%88%BB&salary_level=3',
      { signal: undefined },
    );
  });

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchJobs({ page: 1, prePage: 6 })).rejects.toThrow('500');
  });
});
