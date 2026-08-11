import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableQuery } from './TableQuery';

describe('TableQuery', () => {
  it('shows the term it was given', () => {
    render(<TableQuery query="openstack" setQuery={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('openstack');
  });

  it('shows a term applied from outside after mount', () => {
    // Regression: the box kept its own copy and only reacted to clearing, so a
    // query set by another component filtered the table invisibly.
    const { rerender } = render(<TableQuery query="" setQuery={vi.fn()} />);

    rerender(<TableQuery query="openstack" setQuery={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('openstack');
  });

  it('still clears when the term is removed from outside', () => {
    const { rerender } = render(
      <TableQuery query="openstack" setQuery={vi.fn()} />,
    );

    rerender(<TableQuery query="" setQuery={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('does not overwrite what the user is typing', async () => {
    // The commit is debounced, so mid-word the prop still holds the previous
    // term. Reflecting it would delete the keystrokes.
    const user = userEvent.setup();
    const { rerender } = render(<TableQuery query="" setQuery={vi.fn()} />);

    await user.type(screen.getByRole('searchbox'), 'openst');
    rerender(<TableQuery query="" setQuery={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('openst');
  });
});
