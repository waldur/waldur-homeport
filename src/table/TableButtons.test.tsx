import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TableButtons } from './TableButtons';

const renderButtons = (extra: Record<string, unknown> = {}) => {
  const toggleFilterMenu = vi.fn();
  const onAddFilterClick = vi.fn();
  const props = {
    filters: <div />,
    filterPosition: 'menu',
    columns: [],
    filtersStorage: [],
    showFilterMenuToggle: false,
    toggleFilterMenu,
    ...extra,
  } as unknown as Parameters<typeof TableButtons>[0];
  render(
    <div className="card-table">
      <TableButtons {...props} />
      <button data-add-filter onClick={onAddFilterClick}>
        Add filter
      </button>
    </div>,
  );
  return { toggleFilterMenu, onAddFilterClick };
};

describe('TableButtons filter button', () => {
  it('opens the filter menu and clicks the Add-filter trigger of the same table', async () => {
    const user = userEvent.setup();
    const { toggleFilterMenu, onAddFilterClick } = renderButtons();

    await user.click(screen.getByRole('button', { name: 'Set filters' }));

    expect(toggleFilterMenu).toHaveBeenCalledWith(true);
    expect(onAddFilterClick).toHaveBeenCalledTimes(1);
  });

  it('leaves the Add-filter trigger alone while the menu toggle is shown and no filters are set', async () => {
    const user = userEvent.setup();
    const { onAddFilterClick } = renderButtons({ showFilterMenuToggle: true });

    await user.click(screen.getByRole('button', { name: 'Set filters' }));

    expect(onAddFilterClick).not.toHaveBeenCalled();
  });
});
