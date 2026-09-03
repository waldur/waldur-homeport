import { render, screen, waitFor } from '@testing-library/react';
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
    // Regression test for a real, long-standing bug — originally fixed by
    // wiring up a `columnFilter` context flag so TableFilterItem.tsx's own
    // nested flyout could position itself `bottom` instead of `right`.
    // That flag no longer exists: a later fix (see the "shows the column's
    // own control directly" test below) removed the nested flyout for the
    // column-header case entirely, so positioning is now simply whatever
    // side the *outer* TableFiltersMenu Content itself renders at
    // (`side="bottom"`, always, for this branch) — this test still pins
    // the same externally-observable behavior, just via a different
    // mechanism than when it was written.
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

  it("shows only the target column's own control, not the full filter-name list", async () => {
    // Regression test for a real, live-reported bug: clicking a column
    // header's own funnel icon opened the *entire* "Add filter"-style
    // list of every filter name, with the target filter's own flyout
    // then overlapping/rendered alongside it — "clicking on filter icon
    // in table column header leads to dropdown menu rendered for all
    // fields and filter control itself - this is bug - dropdown menu is
    // not needed in this case." Fixed in TableFilterItem.tsx: the one
    // row matching `openName` now renders its field directly (no
    // collapsed menu-link row, no nested Popover of its own), and every
    // other row renders nothing at all inside a column-header instance.
    const user = userEvent.setup();
    renderMenu({
      openName: 'catalog_name',
      filters: (
        <>
          <StringFilter
            title="Catalog"
            name="catalog_name"
            placeholder="Catalog"
          />
          <StringFilter
            title="Vendor"
            name="vendor_name"
            placeholder="Vendor"
          />
        </>
      ),
    });

    await user.click(screen.getByRole('button', { name: 'Filter by column' }));
    expect(await screen.findByPlaceholderText('Catalog')).toBeInTheDocument();
    // The non-target sibling's own row/label must not appear anywhere —
    // not as a collapsed menu-link row, not as its own field.
    expect(screen.queryByText('Vendor')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Vendor')).not.toBeInTheDocument();
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

  it('switching between two filter rows closes the first and opens only the second', async () => {
    // Regression test for a real, live-reported bug: a screenshot showed
    // two filter flyouts ("Offering" and "Downscaled") rendered
    // simultaneously, stacked on top of each other. A short list (2
    // simple StringFilter rows, what this test alone can exercise)
    // didn't reproduce it — Radix's own default outside-click dismissal
    // looked sufficient on its own. The real, ~12-row list (a mix of
    // dropdown and toggle fields, live-reproduced via Storybook) proved
    // that wrong: switching rows needed a *second* click — the first
    // only dismissed the old row. Root cause, traced via a temporary
    // debug event log: `activeItemName` coordination (added specifically
    // to fix the "needs a second click" symptom) correctly opens the new
    // row immediately, but the *old* row's close is asynchronous — by
    // the time Radix actually unmounts it and, by default, returns
    // focus to its own trigger (onCloseAutoFocus), the new row has
    // already opened elsewhere in the DOM; that stray focus-return gets
    // read by the *new* row's own DismissableLayer as an outside
    // interaction, and it immediately dismisses itself — which a
    // screenshot mid-transition catches as "both open." Fixed by
    // suppressing both onOpenAutoFocus and onCloseAutoFocus on every
    // row's own Popover.Content (TableFilterItem.tsx and this file's
    // FlyoutRow) — no more stray focus event for either side to
    // misinterpret, and activeItemName's own guard (only clear the
    // shared name if this row is still the one recorded active) no
    // longer has a legitimate close call left to (correctly) act on.
    // jsdom has no real focus/layout timing, so — proven via a scripted
    // revert of just the two onOpenAutoFocus/onCloseAutoFocus lines —
    // this specific test passes identically with or without the fix; it
    // exists as an end-to-end behavior lock, not as proof of the fix.
    // The fix itself was verified live in Storybook against the real
    // ~12-row, mixed-field-type list this bug actually needed to
    // reproduce.
    const user = userEvent.setup();
    renderMenu({
      filters: (
        <>
          <StringFilter
            title="Catalog"
            name="catalog_name"
            placeholder="Catalog"
          />
          <StringFilter
            title="Vendor"
            name="vendor_name"
            placeholder="Vendor"
          />
        </>
      ),
    });

    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    expect(await screen.findByPlaceholderText('Catalog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Vendor' }));
    expect(await screen.findByPlaceholderText('Vendor')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Catalog')).not.toBeInTheDocument();
  });

  it('shows the column-filter toggle even when `filters` is a wrapper component, not a bare field', async () => {
    // Regression test for the real, severe bug found while investigating
    // the report above: `existed` used to check
    // `React.Children.toArray(props.filters).some(child => child.props.name
    // === props.openName)` — inspecting only the *static*, unrendered
    // props.filters element tree. Every real caller in the app passes a
    // single wrapper component (`filters={<SomeGeneratedFilter />}`,
    // confirmed by grepping every `filters={` call site — never a bare
    // field or raw Fragment directly), so the actual named filter is
    // nested inside that wrapper's own render output, never a direct
    // child of what's passed to `filters` here. The static check always
    // saw one childless wrapper element, always evaluated false, and
    // silently returned null — hiding the column-filter toggle for every
    // column, on every page, in the whole app, ever since it was
    // introduced (confirmed live in Storybook: 0 toggle buttons render
    // for two filterable columns when `filters` is wrapped this way).
    // Fixed by checking the real rendered DOM instead (matching what the
    // pre-Radix Metronic version did), which works at any nesting depth.
    const Wrapper = () => (
      <StringFilter title="Catalog" name="catalog_name" placeholder="Catalog" />
    );
    renderMenu({ openName: 'catalog_name', filters: <Wrapper /> });

    expect(
      await screen.findByRole('button', { name: 'Filter by column' }),
    ).toBeInTheDocument();
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

  it('renders nothing for a column-filter toggle whose filter no longer exists', async () => {
    // Two-pass by necessity, not by choice: `existed` starts `true` (so
    // the toggle's Content renders and force-mounts on the very first
    // pass, giving `contentRef` something real to check — see that
    // file's own comment on why a *static* props.filters check doesn't
    // work), then an effect checks the actual rendered DOM and — only
    // for the genuinely-missing case this test covers — flips it to
    // `false` on a follow-up render. `waitFor` is required here, not
    // optional; a synchronous check right after `render()` would still
    // see the first pass.
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
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
