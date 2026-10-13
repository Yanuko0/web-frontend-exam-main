import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobCard from './JobCard';

const job = {
  id: '1', companyName: '立刻科技', jobTitle: '資深前端工程師', preview: '招募前端',
};

it('shows job info and opens details with the job id', () => {
  const onOpen = jest.fn();
  render(<JobCard job={job} educationLabel="大學" salaryLabel="待遇面議" onOpen={onOpen} />);
  expect(screen.getByText('立刻科技')).toBeInTheDocument();
  expect(screen.getByText('大學')).toBeInTheDocument();
  expect(screen.getByText('待遇面議')).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: '查看細節' }));
  expect(onOpen).toHaveBeenCalledWith('1');
});
