import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { TableFilterContext } from './FilterContextProvider';
import { StringFilter } from './filters';
import { tableInitialReducer } from './store';
import { TableFiltersMenu } from './TableFiltersMenu';

/**
 * Regression coverage for the Radix conversion: TableFiltersMenu used to
 * drive both its own trigger+menu pair and a per-column "jump straight to
 * this filter" auto-open (menuInstance.show(item), fired from a
 * kt.menu.dropdown.shown listener) through Metronic's MenuComponent.
 * It's a controlled Radix Popover now, with the auto-open threaded
 * through TableFilterContext's `openMenuName` instead.
 */
describe('TableFiltersMenu', () => {
  const renderMenu = (props: Record<string, any> = {}) => {
    const table = 'TableFiltersMenuRegressionTable';
    const store = createStore(combineReducers({ tables: tableInitialReducer }));
    const applyFiltersFn = vi.fn();
    render(
      <Provider store={store}>
        <TableFilterContext.Provider
          value={{
            table,
            filterPosition: 'menu',
            form: 'TableFiltersMenuRegressionForm',
            setFilter: () => undefined,
            registerFilterComponent: () => undefined,
          }}
        >
          <TableFiltersMenu
            table={table}
            filterPosition="menu"
            applyFiltersFn={applyFiltersFn}
            filters={
              <StringFilter
                title="Catalog"
                name="catalog_name"
                placeholder="Catalog"
                instantApply={false}
              />
            }
            {...props}
          />
        </TableFilterContext.Provider>
      </Provider>,
    );
    return { applyFiltersFn };
  };

  it('opens the "Add filter" menu and shows the filter list', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    expect(await screen.findByText('Catalog')).toBeInTheDocument();
  });

  it('the "Add filter" button itself carries Radix\'s trigger state, not just Tip\'s wrapper', async () => {
    // Regression test for a real bug: Tip (src/core/Tooltip.tsx) isn't
    // forwardRef, so nesting it *inside* Trigger asChild left Radix with
    // nothing but Tip itself to attach its ref/merged props to — the
    // button rendered but Popper had no real element to anchor against,
    // and the button never actually carried aria-expanded/data-state.
    // jsdom doesn't fail on bad positioning (no real layout), so this
    // asserts the attributes directly instead — the one part of the bug
    // a DOM-only test *can* catch.
    const user = userEvent.setup();
    renderMenu();

    const button = screen.getByRole('button', { name: 'Add filter' });
    expect(button).toHaveAttribute('data-state', 'closed');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('data-state', 'open');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('the column-filter toggle auto-opens the matching filter once clicked', async () => {
    const user = userEvent.setup();
    renderMenu({ openName: 'catalog_name' });

    await user.click(screen.getByRole('button', { name: 'Filter by column' }));
    expect(await screen.findByPlaceholderText('Catalog')).toBeInTheDocument();
  });

  it('positions the auto-opened filter below the column header, not beside it', async () => {
    // Regression test for a real, long-standing bug: TableFilterItem.tsx
    // positions its own flyout `bottom` (under the trigger) when opened
    // from a column header versus `right` (beside the row) from the "Add
    // filter" list, keyed off TableFilterContext's `columnFilter` flag —
    // but that flag was declared and read since it was introduced
    // (Nov 2024, [WAL-7415]) without ever actually being set anywhere in
    // TableFiltersMenu.tsx, so every filter flyout always positioned as
    // `right` regardless of which trigger opened it. Caught while
    // investigating a live report about the column-header filter icon —
    // the icon itself opened fine, but the flyout landed off to the side
    // instead of dropping cleanly below the header, as the "Add
    // filter"-vs-column-header code was clearly meant to distinguish.
    const user = userEvent.setup();
    renderMenu({ openName: 'catalog_name' });

    await user.click(screen.getByRole('button', { name: 'Filter by column' }));
    const input = await screen.findByPlaceholderText('Catalog');
    // RTL has no "closest ancestor matching a role" query, and this
    // specifically needs the Radix Content wrapper the input is nested
    // inside (the one carrying the `data-side` Radix itself computed) —
    // a direct ancestor lookup is the accurate check here.
    const flyout = input.closest('[role="dialog"]'); // eslint-disable-line testing-library/no-node-access
    expect(flyout).toHaveAttribute('data-side', 'bottom');
  });

  it("keeps a filter row in the DOM while its menu is closed, for TableBody.tsx's hasFilterMenu() to find", () => {
    // Metronic's own markup was always mounted (CSS-hidden while closed);
    // Radix's default would unmount this — forceMount restores the
    // original always-present behaviour. TableBody.tsx's hasFilterMenu()
    // decides whether to show a cell's inline-filter shortcut by
    // querying the DOM for exactly this id, so its absence here would be
    // a real, silent regression, not just a cosmetic one.
    renderMenu();
    // RTL has no "find by id" query, and this specifically pins the
    // exact selector hasFilterMenu() itself queries — a raw ID lookup is
    // the accurate check here, not a workaround.
    const filterItem = document.getElementById('filter-item-catalog_name'); // eslint-disable-line testing-library/no-node-access, no-restricted-syntax
    expect(filterItem).toBeInTheDocument();
  });

  it('opens the doubly-nested "Saved filters" flyout without crashing', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(await screen.findByText(/Saved filters/));

    // SavedFilterSelect (a react-select) renders inside the flyout — its
    // own placeholder is the signal the second, nested Popover opened.
    expect(await screen.findByText('Select saved filter')).toBeInTheDocument();
  });

  it('renders nothing for a column-filter toggle whose filter no longer exists', () => {
    const { container } = render(
      <Provider
        store={createStore(combineReducers({ tables: tableInitialReducer }))}
      >
        <TableFilterContext.Provider
          value={{
            table: 'x',
            filterPosition: 'menu',
            form: 'x',
            setFilter: () => undefined,
            registerFilterComponent: () => undefined,
          }}
        >
          <TableFiltersMenu
            table="x"
            filterPosition="menu"
            applyFiltersFn={vi.fn()}
            openName="does_not_exist"
            filters={
              <StringFilter
                title="Catalog"
                name="catalog_name"
                placeholder="Catalog"
              />
            }
          />
        </TableFilterContext.Provider>
      </Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
