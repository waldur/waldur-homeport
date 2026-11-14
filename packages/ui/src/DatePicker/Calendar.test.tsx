import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Calendar } from './Calendar';

const month = new Date(2026, 9, 1);

describe('Calendar', () => {
  it('keeps its grid when its parent re-renders', () => {
    const { rerender } = render(<Calendar mode="single" month={month} />);
    const grid = screen.getByRole('grid');
    const day = screen.getByRole('button', { name: /October 15/ });

    rerender(<Calendar mode="single" month={month} className="mt-2" />);

    expect(screen.getByRole('grid')).toBe(grid);
    expect(screen.getByRole('button', { name: /October 15/ })).toBe(day);
  });
});
