import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableFilterButton } from './TableFilterButton';

const getButton = () => screen.getByRole('button', { name: 'Set filters' });

describe('TableFilterButton', () => {
  it('is an icon-only button named by its tooltip, and calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TableFilterButton onClick={onClick} />);

    await user.click(getButton());

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows no badge without an active filter', () => {
    render(<TableFilterButton onClick={vi.fn()} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('ignores a count when no filter is active', () => {
    render(<TableFilterButton onClick={vi.fn()} filterCount={4} />);

    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('shows the number of active filters', () => {
    render(<TableFilterButton onClick={vi.fn()} hasFilter filterCount={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('caps the badge at 9+', () => {
    render(<TableFilterButton onClick={vi.fn()} hasFilter filterCount={12} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });

  it('hides the badge when hasFilter is set but the count is 0', () => {
    render(<TableFilterButton onClick={vi.fn()} hasFilter filterCount={0} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  // The badge used to wrap the button only while it had a count, changing the
  // tree shape at that position, so React remounted the button -- dropping
  // focus and tooltip state -- whenever the count crossed zero.
  it('keeps the same button element as the count comes and goes', () => {
    const onClick = vi.fn();
    const { rerender } = render(<TableFilterButton onClick={onClick} />);
    const before = getButton();

    rerender(<TableFilterButton onClick={onClick} hasFilter filterCount={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(getButton()).toBe(before);

    rerender(<TableFilterButton onClick={onClick} />);
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(getButton()).toBe(before);
  });

  it('does not lose keyboard focus when the count appears', () => {
    const onClick = vi.fn();
    const { rerender } = render(<TableFilterButton onClick={onClick} />);
    getButton().focus();

    rerender(<TableFilterButton onClick={onClick} hasFilter filterCount={1} />);

    expect(getButton()).toHaveFocus();
  });
});
