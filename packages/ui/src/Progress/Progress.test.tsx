import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Progress, progressPercent } from './Progress';

describe('progressPercent', () => {
  it.each([
    [50, 100, 50],
    [1, 4, 25],
    [150, 100, 100],
    [-5, 100, 0],
    [NaN, 100, 0],
    [0, 0, 0],
    [5, 0, 0],
    [5, -1, 0],
  ])('value %s of max %s is %s%%', (value, max, expected) => {
    expect(progressPercent(value, max)).toBe(expected);
  });
});

describe('Progress', () => {
  it('names the progressbar and reports its value', () => {
    render(<Progress value={40} label="CPU cores" />);
    const bar = screen.getByRole('progressbar', { name: 'CPU cores' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('reports 0 for a 0/0 quota instead of NaN', () => {
    render(<Progress value={0} max={0} label="Tokens" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('keeps the track when the fill is empty', () => {
    render(<Progress value={0} label="Empty" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('progress-segment')).not.toBeInTheDocument();
  });

  it('sizes the fill against max', () => {
    render(<Progress value={1} max={4} />);
    expect(screen.getByTestId('progress-segment')).toHaveStyle({
      width: '25%',
    });
  });

  it('stacks segments and never exceeds the track', () => {
    render(
      <Progress
        label="Stack"
        segments={[
          { value: 60, variant: 'success', label: 'Normal' },
          { value: 30, variant: 'warning' },
          { value: 30, variant: 'danger' },
        ]}
      />,
    );
    const fills = screen.getAllByTestId('progress-segment');
    expect(fills.map((fill) => fill.style.width)).toEqual([
      '60%',
      '30%',
      '10%',
    ]);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<Progress indeterminate label="Loading" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute(
      'aria-valuenow',
    );
    expect(screen.getByTestId('progress-indeterminate')).toBeInTheDocument();
  });

  it('sets the size and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={10} size="xs" className="mt-2" />);
    expect(ref.current).toHaveAttribute('data-size', 'xs');
    expect(ref.current).toHaveClass('mt-2');
  });
});
