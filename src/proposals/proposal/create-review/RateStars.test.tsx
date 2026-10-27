import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RateStars } from './RateStars';

const EditableStars = ({ initial = 0, onChange = vi.fn() }) => {
  const [value, setValue] = useState(initial);
  return (
    <RateStars
      value={value}
      count={5}
      edit
      isHalf={false}
      label="How satisfied are you?"
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
};

describe('RateStars', () => {
  it('is a named radio group with one named radio per star', () => {
    render(<EditableStars initial={3} />);

    const group = screen.getByRole('radiogroup', {
      name: 'How satisfied are you?',
    });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '1 star' })).not.toBeChecked();
  });

  it('has one tab stop: the chosen star, or the first one', () => {
    const { unmount } = render(<EditableStars />);
    expect(screen.getAllByRole('radio').map((star) => star.tabIndex)).toEqual([
      0, -1, -1, -1, -1,
    ]);
    unmount();

    render(<EditableStars initial={4} />);
    expect(screen.getAllByRole('radio').map((star) => star.tabIndex)).toEqual([
      -1, -1, -1, 0, -1,
    ]);
  });

  it('moves and selects with the arrow, Home and End keys', async () => {
    const onChange = vi.fn();
    render(<EditableStars initial={2} onChange={onChange} />);

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '2 stars' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '3 stars' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();

    await userEvent.keyboard('{End}');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '5 stars' })).toBeChecked();

    await userEvent.keyboard('{Home}');
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: '1 star' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('stays plain markup when read-only', () => {
    render(<RateStars value={3} />);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
