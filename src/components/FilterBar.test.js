import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from './FilterBar';

const educationLevels = [{ id: '4', label: '大學' }];
const salaryLevels = [{ id: '1', label: '待遇面議' }];

const setup = (initialFilters) => {
  const onSearch = jest.fn();
  render(
    <FilterBar
      educationLevels={educationLevels}
      salaryLevels={salaryLevels}
      onSearch={onSearch}
      initialFilters={initialFilters}
    />,
  );
  return onSearch;
};

it('submits the typed company name only when searching', () => {
  const onSearch = setup();
  userEvent.type(screen.getByPlaceholderText('請輸入公司名稱'), ' 立刻 ');
  expect(onSearch).not.toHaveBeenCalled();
  userEvent.click(screen.getByRole('button', { name: '條件搜尋' }));
  expect(onSearch).toHaveBeenCalledWith({
    companyName: '立刻', educationLevel: '', salaryLevel: '',
  });
});

it('starts from the given filters and clears them with the reset button', () => {
  const onSearch = setup({ companyName: '餐飲', educationLevel: '', salaryLevel: '' });
  expect(screen.getByPlaceholderText('請輸入公司名稱')).toHaveValue('餐飲');
  userEvent.click(screen.getByRole('button', { name: '清除' }));
  expect(screen.getByPlaceholderText('請輸入公司名稱')).toHaveValue('');
  expect(onSearch).toHaveBeenCalledWith({
    companyName: '', educationLevel: '', salaryLevel: '',
  });
});

it('hides the reset button when nothing is filled in', () => {
  setup();
  expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument();
});
