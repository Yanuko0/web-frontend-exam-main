import {
  educationLevels, getJob, listJobs, salaryLevels,
} from './jobs';

describe('listJobs', () => {
  it('returns every job when no params are given', () => {
    const { data, total } = listJobs({});
    expect(total).toBe(50);
    expect(data).toHaveLength(50);
  });

  it('paginates and reports the filtered total', () => {
    const first = listJobs({ page: '1', prePage: '6' });
    const second = listJobs({ page: '2', prePage: '6' });
    expect(first.data).toHaveLength(6);
    expect(first.total).toBe(50);
    expect(second.data[0].id).toBe('7');
  });

  it('omits the heavy detail fields from list items', () => {
    const [job] = listJobs({ page: '1', prePage: '1' }).data;
    expect(job).not.toHaveProperty('description');
    expect(job).not.toHaveProperty('companyPhoto');
    expect(job).toHaveProperty('preview');
  });

  it('filters by company name, education and salary', () => {
    const byName = listJobs({ companyName: '立刻' });
    expect(byName.total).toBeGreaterThan(0);
    expect(byName.data.every((job) => job.companyName.includes('立刻'))).toBe(true);

    const byEducation = listJobs({ educationLevel: '4' });
    expect(byEducation.data.every((job) => job.educationId === 4)).toBe(true);

    const bySalary = listJobs({ salaryLevel: '3' });
    expect(bySalary.data.every((job) => job.salaryId === 3)).toBe(true);
  });

  it('ignores invalid pagination params', () => {
    expect(listJobs({ page: 'x', prePage: '6' }).data).toHaveLength(50);
    expect(listJobs({ page: '0', prePage: '6' }).data).toHaveLength(50);
  });
});

describe('getJob', () => {
  it('returns the detail fields only', () => {
    const job = getJob('1');
    expect(job).toHaveProperty('description');
    expect(job.companyPhoto.length).toBeGreaterThan(0);
    expect(job).not.toHaveProperty('preview');
    expect(job).not.toHaveProperty('educationId');
  });

  it('returns null for an unknown id', () => {
    expect(getJob('9999')).toBeNull();
  });
});

describe('option lists', () => {
  it('expose string ids and labels', () => {
    expect(educationLevels[0]).toEqual({ id: '1', label: '國小' });
    expect(salaryLevels[0]).toEqual({ id: '1', label: '待遇面議' });
  });
});

describe('input limits', () => {
  it('caps the page size so one request stays cheap', () => {
    expect(listJobs({ page: '1', prePage: '100000' }).data).toHaveLength(50);
    expect(listJobs({ page: '1', prePage: '100' }).data).toHaveLength(50);
  });

  it('ignores absurdly long company names instead of scanning with them', () => {
    const long = '立'.repeat(5000);
    expect(() => listJobs({ companyName: long })).not.toThrow();
    // Truncated to the maximum length, so it cannot match anything real.
    expect(listJobs({ companyName: long }).total).toBe(0);
  });

  it('treats the name as plain text, never as a pattern', () => {
    expect(listJobs({ companyName: '.*' }).total).toBe(0);
    expect(listJobs({ companyName: '(' }).total).toBe(0);
  });
});
