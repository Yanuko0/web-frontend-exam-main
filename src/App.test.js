import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const jobs = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  companyName: `公司${i + 1}`,
  jobTitle: '前端工程師',
  educationId: 4,
  salaryId: 1,
  preview: '預覽',
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    let body = [];
    if (url.startsWith('/api/v1/jobs/')) {
      body = {
        id: '1', companyName: '公司1', jobTitle: '前端', companyPhoto: [], description: '<p>工作描述</p>',
      };
    } else if (url.startsWith('/api/v1/jobs')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const size = Number(params.get('pre_page'));
      const start = (Number(params.get('page')) - 1) * size;
      body = { data: jobs.slice(start, start + size), total: jobs.length };
    } else if (url.includes('educationLevelList')) {
      body = [{ id: '4', label: '大學' }];
    } else {
      body = [{ id: '1', label: '待遇面議' }];
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  });
});

it('renders a page of jobs and opens the detail dialog', async () => {
  render(<App />);
  expect(await screen.findByText('公司1')).toBeInTheDocument();
  expect(screen.queryByText('公司5')).not.toBeInTheDocument();
  userEvent.click(screen.getAllByRole('button', { name: '查看細節' })[0]);
  expect(await screen.findByText('工作描述')).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: '關閉' }));
  await waitFor(() => expect(screen.queryByText('工作描述')).not.toBeInTheDocument());
});

it('goes to the next page', async () => {
  render(<App />);
  await screen.findByText('公司1');
  userEvent.click(screen.getByRole('button', { name: /下一頁/ }));
  expect(await screen.findByText('公司5')).toBeInTheDocument();
});

it('serves an already visited page from cache without refetching', async () => {
  render(<App />);
  await screen.findByText('公司1');
  userEvent.click(screen.getByRole('button', { name: /下一頁/ }));
  await screen.findByText('公司5');
  const callsBefore = global.fetch.mock.calls.length;
  userEvent.click(screen.getByRole('button', { name: /上一頁/ }));
  expect(await screen.findByText('公司1')).toBeInTheDocument();
  const jobListCalls = global.fetch.mock.calls.slice(callsBefore)
    .filter(([url]) => url.startsWith('/api/v1/jobs?page=1'));
  expect(jobListCalls).toHaveLength(0);
});

it('prefetches job details on hover so the popup opens from cache', async () => {
  render(<App />);
  await screen.findByText('公司1');
  // Job 1 is already cached by an earlier test, so use the second card.
  const button = screen.getAllByRole('button', { name: '查看細節' })[1];
  userEvent.hover(button);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/v1/jobs/2', expect.anything()));
  const detailCalls = () => global.fetch.mock.calls.filter(([url]) => url === '/api/v1/jobs/2');
  expect(detailCalls()).toHaveLength(1);
  userEvent.click(button);
  expect(await screen.findByText('工作描述')).toBeInTheDocument();
  expect(detailCalls()).toHaveLength(1);
});

it('shows the total number of jobs', async () => {
  render(<App />);
  expect(await screen.findByText('共 10 筆職缺')).toBeInTheDocument();
});

it('keeps the URL unchanged when changing pages', async () => {
  render(<App />);
  await screen.findByText('公司1');
  const before = window.location.href;
  userEvent.click(screen.getByRole('button', { name: /下一頁/ }));
  await screen.findByText('公司5');
  expect(window.location.href).toBe(before);
});

it('applies the reduced-motion override through CssBaseline', async () => {
  render(<App />);
  await screen.findByText('公司1');
  const styles = [...document.querySelectorAll('style')].map((node) => node.textContent).join('');
  expect(styles).toMatch(/prefers-reduced-motion:\s*reduce/);
  expect(styles).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
});
