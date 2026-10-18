import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RangeInput } from './RangeInput';

describe('RangeInput', () => {
  it('is a native range slider with a default 0-100 range', () => {
    render(<RangeInput aria-label="Score" value={20} onChange={() => {}} />);
    const slider = screen.getByRole('slider', { name: 'Score' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('reports a change through onChange', () => {
    const onChange = vi.fn();
    render(<RangeInput aria-label="Score" value={20} onChange={onChange} />);
    // eslint-disable-next-line testing-library/prefer-user-event -- user-event cannot drag a range thumb
    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it.each([
    [0, 0, 100, '0%'],
    [25, 0, 100, '25%'],
    [100, 0, 100, '100%'],
    [150, 0, 100, '100%'],
    [-5, 0, 100, '0%'],
    [15, 10, 20, '50%'],
  ])('fills %s of %s-%s as %s', (value, min, max, fill) => {
    render(
      <RangeInput
        aria-label="Score"
        value={value}
        min={min}
        max={max}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('slider').style.getPropertyValue('--range-progress'),
    ).toBe(fill);
  });

  it('does not take a change when disabled', () => {
    const onChange = vi.fn();
    render(
      <RangeInput aria-label="Score" value={20} disabled onChange={onChange} />,
    );
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
