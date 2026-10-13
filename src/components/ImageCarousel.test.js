import React from 'react';
import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageCarousel, { slideOffset, windowStartFor } from './ImageCarousel';

const images = ['/a.jpg', '/b.jpg', '/c.jpg', '/d.jpg', '/e.jpg'];

describe('slideOffset', () => {
  it('centres the active slide and wraps around at both ends', () => {
    expect(slideOffset(0, 0, 5)).toBe(0);
    expect(slideOffset(1, 0, 5)).toBe(1);
    expect(slideOffset(4, 0, 5)).toBe(-1); // the last slide sits before the first
    expect(slideOffset(0, 4, 5)).toBe(1); // and the first follows the last
  });

  it('handles tiny galleries', () => {
    expect(slideOffset(0, 0, 1)).toBe(0);
    expect(slideOffset(0, 0, 2)).toBe(0);
    expect(slideOffset(1, 0, 2)).toBe(1);
    expect(slideOffset(0, 1, 2)).toBe(1);
  });
});

describe('windowStartFor', () => {
  it('slides the 3-photo window only when the selection leaves it', () => {
    expect([0, 1, 2, 3, 4].map((active) => windowStartFor(active, 5))).toEqual([0, 1, 2, 2, 2]);
  });

  it('never slides when everything fits', () => {
    expect([0, 1, 2].map((active) => windowStartFor(active, 3))).toEqual([0, 0, 0]);
    expect(windowStartFor(1, 2)).toBe(0);
  });
});

describe('ImageCarousel', () => {
  const currentDot = () => screen
    .getAllByRole('button', { name: /^第 \d 張$/ })
    .filter((button) => button.getAttribute('aria-current') === 'true');

  it('moves exactly one photo per step, including wrapping past the end', () => {
    render(<ImageCarousel images={images} />);
    const next = screen.getByRole('button', { name: '下一張' });
    const dotsActive = () => within(screen.getByRole('region')).getAllByRole('button', { name: /第 \d 張/ })
      .filter((button) => button.getAttribute('aria-current') === 'true')
      .map((button) => button.getAttribute('aria-label'));

    expect(dotsActive()).toContain('第 1 張');
    userEvent.click(next);
    expect(dotsActive()).toContain('第 2 張');
    userEvent.click(next);
    userEvent.click(next);
    userEvent.click(next);
    expect(dotsActive()).toContain('第 5 張');
    userEvent.click(next); // wraps to the first photo instead of stopping
    expect(dotsActive()).toContain('第 1 張');
    expect(currentDot().length).toBeGreaterThan(0);
  });

  it('supports the keyboard', () => {
    render(<ImageCarousel images={images} />);
    const region = screen.getByRole('region');
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(within(region).getAllByRole('button', { name: '第 5 張' })
      .some((button) => button.getAttribute('aria-current') === 'true')).toBe(true);
  });

  it('selects a neighbour on click and opens the preview on the selected photo', () => {
    render(<ImageCarousel images={images} />);
    // The slide comes before its dot in the DOM.
    userEvent.click(screen.getAllByRole('button', { name: '第 2 張' })[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: '點擊放大第 2 張' }));
    expect(screen.getByRole('dialog', { name: '圖片預覽' })).toBeInTheDocument();
  });
});
