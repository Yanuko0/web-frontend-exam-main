import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImagePreview, { clampScale, MAX_SCALE, MIN_SCALE } from './ImagePreview';

const images = ['/a.jpg', '/b.jpg', '/c.jpg'];

function Harness({ onClose }) {
  const [index, setIndex] = useState(0);
  return (
    <ImagePreview
      images={images}
      index={index}
      open
      onClose={onClose}
      onIndexChange={setIndex}
    />
  );
}

Harness.propTypes = {
  onClose: PropTypes.func.isRequired,
};

describe('clampScale', () => {
  it('keeps the zoom within limits', () => {
    expect(clampScale(0.1)).toBe(MIN_SCALE);
    expect(clampScale(99)).toBe(MAX_SCALE);
    expect(clampScale(1.5)).toBe(1.5);
  });
});

describe('ImagePreview', () => {
  it('zooms in and out in steps and resets', () => {
    render(<Harness onClose={() => {}} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: '放大' }));
    expect(screen.getByText('125%')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: '縮小' }));
    userEvent.click(screen.getByRole('button', { name: '縮小' }));
    expect(screen.getByText('75%')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: '還原' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('disables zoom out at the minimum scale', () => {
    render(<Harness onClose={() => {}} />);
    const out = screen.getByRole('button', { name: '縮小' });
    for (let i = 0; i < 2; i += 1) userEvent.click(out);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(out).toBeDisabled();
  });

  it('zooms with the keyboard and switches images with the arrows', () => {
    render(<Harness onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: '+' });
    expect(screen.getByText('125%')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: '0' });
    expect(screen.getByText('100%')).toBeInTheDocument();

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(screen.getByText('3 / 3')).toBeInTheDocument(); // wraps around
  });

  it('closes with the button and with Escape', () => {
    const onClose = jest.fn();
    render(<Harness onClose={onClose} />);
    userEvent.click(screen.getByRole('button', { name: '關閉預覽' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    userEvent.keyboard('{esc}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('toggles zoom on double click', () => {
    render(<Harness onClose={() => {}} />);
    fireEvent.doubleClick(screen.getByRole('img', { name: '公司環境照片 1' }));
    expect(screen.getByText('200%')).toBeInTheDocument();
    fireEvent.doubleClick(screen.getByRole('img', { name: '公司環境照片 1' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
