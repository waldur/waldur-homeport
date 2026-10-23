import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, useEffect } from 'react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { renderWithProviders } from '@/test/harness';

import { setFilter } from './actions';
import BaseTable from './BaseTable';
import { createTablesStore } from './store';
import { useTable } from './useTable';
import { getSavedFiltersKey } from './utils';

const TABLE = 'filter-sheet-test';
const FORM_ID = 'filter-sheet-form';

const Harness = () => {
  const props = useTable({
    table: TABLE,
    fetchData: vi.fn(() => Promise.resolve({ rows: [], resultCount: 0 })),
  });
  return (
    <BaseTable
      {...props}
      columns={[{ title: 'Name', render: () => null }]}
      filterPosition="sidebar"
      filters={<p>Name filter</p>}
      formId={FORM_ID}
    />
  );
};

// No DrawerProvider: the table owns its filter panel.
const renderTable = () => {
  const store = createTablesStore();
  renderWithProviders(
    <Provider store={store}>
      <Harness />
    </Provider>,
  );
  return store;
};

const openPanel = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Set filters' }));
  return screen.findByRole('dialog', { name: 'Filters' });
};

describe('the table filter panel', () => {
  afterEach(() => localStorage.clear());

  it('opens in a sheet without an app drawer and applies on Apply', async () => {
    const store = renderTable();

    const panel = await openPanel();
    expect(within(panel).getByText('Name filter')).toBeVisible();
    expect(store.getState().tables[TABLE].applyFilters).toBe(false);

    await userEvent.click(within(panel).getByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull(),
    );
    expect(store.getState().tables[TABLE].applyFilters).toBe(true);
  });

  it('closes on Cancel without applying', async () => {
    const store = renderTable();

    const panel = await openPanel();
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Cancel' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull(),
    );
    expect(store.getState().tables[TABLE].applyFilters).toBe(false);
  });

  const STATE = { name: 'state', value: 'OK', label: null };
  const NAME = { name: 'name', value: 'lab', label: null };
  // A filter field in the panel writes to the store as it is edited.
  const editInPanel = (store, item) =>
    act(() => {
      store.dispatch(setFilter(TABLE, item));
    });
  const filters = (store) => store.getState().tables[TABLE].filtersStorage;

  it('puts the filters back on Cancel and on Escape', async () => {
    const store = renderTable();
    act(() => {
      store.dispatch(setFilter(TABLE, STATE));
    });

    const panel = await openPanel();
    editInPanel(store, NAME);
    editInPanel(store, { ...STATE, value: 'Erred' });
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Cancel' }),
    );
    expect(filters(store)).toEqual([STATE]);

    await openPanel();
    editInPanel(store, NAME);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull(),
    );
    expect(filters(store)).toEqual([STATE]);
  });

  it('keeps the filters set in the panel on Apply', async () => {
    const store = renderTable();

    const panel = await openPanel();
    editInPanel(store, NAME);
    await userEvent.click(within(panel).getByRole('button', { name: 'Apply' }));

    expect(filters(store)).toEqual([NAME]);
  });

  it('returns focus to the Filters button when the panel closes', async () => {
    renderTable();
    const button = screen.getByRole('button', { name: 'Set filters' });
    const closesWith = async (
      close: (panel: HTMLElement) => Promise<unknown>,
    ) => {
      await close(await openPanel());
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull(),
      );
      await waitFor(() => expect(button).toHaveFocus());
    };

    await closesWith(() => userEvent.keyboard('{Escape}'));
    await closesWith((panel) =>
      userEvent.click(within(panel).getByRole('button', { name: 'Cancel' })),
    );
    await closesWith((panel) =>
      userEvent.click(within(panel).getByRole('button', { name: 'Apply' })),
    );
  });

  it("saves a filter under the table's form id", async () => {
    renderTable();

    const panel = await openPanel();
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Save filter' }),
    );

    expect(
      JSON.parse(localStorage.getItem(getSavedFiltersKey(TABLE, FORM_ID))),
    ).toHaveLength(1);
    expect(localStorage.getItem(getSavedFiltersKey(TABLE, ''))).toBeNull();
  });

  it('stacks over a drawer the table lives in, which stays open after', async () => {
    const OpenDrawer = () => {
      const { openDrawer } = useDrawer();
      useEffect(() => openDrawer(Harness, { title: 'Project' }), []);
      return <DrawerRoot />;
    };
    renderWithProviders(
      <Provider store={createTablesStore()}>
        <DrawerProvider>
          <OpenDrawer />
        </DrawerProvider>
      </Provider>,
    );
    const drawer = await screen.findByRole('dialog', { name: 'Project' });

    const panel = await openPanel();
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Cancel' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull(),
    );
    expect(drawer).toBeInTheDocument();
    expect(
      within(drawer).getByRole('button', { name: 'Set filters' }),
    ).toBeVisible();
  });
});
