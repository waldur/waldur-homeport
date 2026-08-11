import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrdersFilter } from './OrdersFilter';

describe('OrdersFilter', () => {
  it('shows the preset matching the given day count', () => {
    render(<OrdersFilter days={30} onDaysChange={vi.fn()} />);

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('keeps the bare placeholder for callers that offer no all-time choice', () => {
    // The two reporting pages rely on this: they always hold a preset, and a
    // stray "All time" entry would be a scope they cannot actually apply.
    render(<OrdersFilter days={undefined} onDaysChange={vi.fn()} />);

    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('names the unscoped state once the all-time choice is offered', () => {
    render(
      <OrdersFilter
        days={undefined}
        onDaysChange={vi.fn()}
        onAllTime={vi.fn()}
      />,
    );

    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.queryByText('Select...')).not.toBeInTheDocument();
  });

  it('names a range no preset describes instead of implying no scope', () => {
    render(
      <OrdersFilter
        days={undefined}
        isCustom
        onDaysChange={vi.fn()}
        onAllTime={vi.fn()}
      />,
    );

    expect(screen.getByText('Custom range')).toBeInTheDocument();
  });

  it('does not offer "Custom range" in the menu', async () => {
    const user = userEvent.setup();
    render(
      <OrdersFilter
        days={undefined}
        isCustom
        onDaysChange={vi.fn()}
        onAllTime={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');

    expect(
      within(listbox).queryByRole('option', { name: 'Custom range' }),
    ).not.toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'All time' }),
    ).toBeInTheDocument();
  });

  it('reports the chosen preset as a day count', async () => {
    const onDaysChange = vi.fn();
    const user = userEvent.setup();
    render(<OrdersFilter days={7} onDaysChange={onDaysChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Last 30 days',
      }),
    );

    expect(onDaysChange).toHaveBeenCalledWith(30);
  });

  it('routes the all-time choice to its own handler', async () => {
    const onDaysChange = vi.fn();
    const onAllTime = vi.fn();
    const user = userEvent.setup();
    render(
      <OrdersFilter
        days={7}
        onDaysChange={onDaysChange}
        onAllTime={onAllTime}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'All time',
      }),
    );

    expect(onAllTime).toHaveBeenCalled();
    expect(onDaysChange).not.toHaveBeenCalled();
  });
});
