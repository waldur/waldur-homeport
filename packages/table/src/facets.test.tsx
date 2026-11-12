import { ModalProvider } from '@/modal/ModalContext';
import { renderHookWithProviders, renderWithProviders } from '@/test/harness';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import {
  facetOption,
  TableFacetsProvider,
  TableFacetsSource,
  useTableFacet,
} from './facets';
import { AsyncSelectFilter, limitToFacet, SelectFilter } from './filters';
import { tablesReducer } from './store';
import { TableFilterContainer } from './TableFilterContainer';

const facet = (
  name: string,
  values: [string, number][],
  truncated = false,
) => ({
  name,
  truncated,
  values: values.map(([value, count]) => ({ value, label: value, count })),
});

const source = (
  fetch: TableFacetsSource['fetch'],
  params: Record<string, any> = {},
): TableFacetsSource => ({
  table: 'FacetsTable',
  fetch,
  params,
  query: { accessible: true },
});

const withSource =
  (value?: TableFacetsSource) =>
  ({ children }: { children: ReactNode }) => (
    <TableFacetsProvider value={value}>{children}</TableFacetsProvider>
  );

describe('useTableFacet', () => {
  it('is undefined on a table without facets', () => {
    const { result } = renderHookWithProviders(() => useTableFacet('state'), {
      wrapper: withSource(undefined),
    });
    expect(result.current).toBeUndefined();
  });

  it('asks for its own facet under the table filter and fixed query', async () => {
    const fetch = vi.fn().mockResolvedValue({
      data: [facet('state', [['Active', 2]])],
    });
    const { result } = renderHookWithProviders(() => useTableFacet('state'), {
      wrapper: withSource(source(fetch, { keyword: 'gpu', shared: true })),
    });

    await waitFor(() => expect(result.current.counts).toBeDefined());
    expect(result.current.counts.get('Active')).toBe(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          accessible: true,
          keyword: 'gpu',
          shared: true,
          facet: 'state',
        },
      }),
    );
  });

  it('asks for more values when given a limit', async () => {
    const fetch = vi.fn().mockResolvedValue({
      data: [facet('license', [['MIT', 1]])],
    });
    const { result } = renderHookWithProviders(
      () => useTableFacet('license', 1000),
      { wrapper: withSource(source(fetch)) },
    );

    await waitFor(() => expect(result.current.counts).toBeDefined());
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          facet: 'license',
          facet_limit: 1000,
        }),
      }),
    );
  });

  it('gives the filter back when the count fails', async () => {
    // An older backend answers 404 for a facets action it does not have.
    const fetch = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('Not found'), { status: 404 }),
      );
    const { result } = renderHookWithProviders(() => useTableFacet('state'), {
      wrapper: withSource(source(fetch)),
    });

    expect(result.current).toBeDefined();
    await waitFor(() => expect(result.current).toBeUndefined());
  });

  it('searches a complete facet in memory', async () => {
    const fetch = vi.fn().mockResolvedValue({
      data: [
        facet('customer', [
          ['Alpha', 2],
          ['Beta', 1],
        ]),
      ],
    });
    const { result } = renderHookWithProviders(
      () => useTableFacet('customer'),
      { wrapper: withSource(source(fetch)) },
    );

    const found = await result.current.loadValues('alp');
    expect(found.map((v) => v.value)).toEqual(['Alpha']);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('asks the server to search a truncated facet', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        data: [facet('customer', [['Alpha', 2]], true)],
      })
      .mockResolvedValueOnce({ data: [facet('customer', [['Zeta', 1]])] });
    const { result } = renderHookWithProviders(
      () => useTableFacet('customer'),
      { wrapper: withSource(source(fetch)) },
    );

    const found = await result.current.loadValues('zet');
    expect(found.map((v) => v.value)).toEqual(['Zeta']);
    expect(fetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ facet: 'customer', facet_q: 'zet' }),
      }),
    );
  });
});

describe('limitToFacet', () => {
  const options = [
    { value: 'ok', label: 'OK' },
    { value: 'erred', label: 'Erred' },
    { value: true, label: 'Yes' },
  ];
  const counts = new Map([
    ['ok', 3],
    ['true', 1],
  ]);
  const getValue = (option) => option.value;

  it('keeps options whose value has rows, booleans included', () => {
    expect(limitToFacet(options, counts, null, getValue)).toEqual([
      options[0],
      options[2],
    ]);
  });

  it('keeps the current selection although it has no rows', () => {
    expect(
      limitToFacet(options, counts, [{ value: 'erred' }], getValue),
    ).toHaveLength(3);
    expect(limitToFacet(options, counts, 'erred', getValue)).toHaveLength(3);
  });
});

const renderFilter = (fetch, filter: JSX.Element) => {
  const store = createStore(combineReducers({ tables: tablesReducer }));
  renderWithProviders(
    <Provider store={store}>
      <ModalProvider>
        <TableFacetsProvider value={source(fetch)}>
          <TableFilterContainer
            table="FacetsTable"
            formId="FacetsForm"
            setFilter={() => undefined}
            filters={filter}
          />
        </TableFacetsProvider>
      </ModalProvider>
    </Provider>,
  );
};

describe('AsyncSelectFilter with a facet', () => {
  it('lists the facet values instead of loading options', async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn();
    const fetch = vi.fn().mockResolvedValue({
      data: [
        {
          name: 'category',
          truncated: false,
          values: [{ value: 'c1', label: 'Compute', count: 4 }],
        },
      ],
    });
    renderFilter(
      fetch,
      <AsyncSelectFilter
        title="Category"
        name="category"
        facet="category"
        facetOption={facetOption('uuid', 'title')}
        loadOptions={loadOptions}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.title}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Category' }));
    expect(await screen.findByText('(4)')).toBeInTheDocument();
    expect(screen.getByText(/Compute/)).toBeInTheDocument();
    expect(loadOptions).not.toHaveBeenCalled();
  });
});

describe('SelectFilter with a facet', () => {
  it('offers only values the facet has, with their counts', async () => {
    const user = userEvent.setup();
    const fetch = vi.fn().mockResolvedValue({
      data: [facet('state', [['ok', 3]])],
    });
    const store = createStore(combineReducers({ tables: tablesReducer }));
    renderWithProviders(
      <Provider store={store}>
        <ModalProvider>
          <TableFacetsProvider value={source(fetch)}>
            <TableFilterContainer
              table="FacetsTable"
              formId="FacetsForm"
              setFilter={() => undefined}
              filters={
                <SelectFilter
                  title="State"
                  name="state"
                  facet="state"
                  options={[
                    { value: 'ok', label: 'OK' },
                    { value: 'erred', label: 'Erred' },
                  ]}
                />
              }
            />
          </TableFacetsProvider>
        </ModalProvider>
      </Provider>,
    );

    // Counted only once the filter is opened, not when the table registers it.
    expect(fetch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'State' }));
    expect(await screen.findByText('(3)')).toBeInTheDocument();
    expect(screen.getByText(/OK/)).toBeInTheDocument();
    expect(screen.queryByText(/Erred/)).not.toBeInTheDocument();
  });
});

describe('SelectFilter without options', () => {
  it('offers the facet values themselves', async () => {
    const user = userEvent.setup();
    const fetch = vi.fn().mockResolvedValue({
      data: [facet('status', [['Waiting for customer', 2]])],
    });
    renderFilter(
      fetch,
      <SelectFilter title="Status" name="status" facet="status" />,
    );

    await user.click(screen.getByRole('button', { name: 'Status' }));
    expect(await screen.findByText('(2)')).toBeInTheDocument();
    expect(screen.getByText(/Waiting for customer/)).toBeInTheDocument();
  });
});

describe('AsyncSelectFilter with its own option label', () => {
  it('draws the label and adds the count', async () => {
    const user = userEvent.setup();
    const fetch = vi.fn().mockResolvedValue({
      data: [facet('project', [['p1', 18]])],
    });
    renderFilter(
      fetch,
      <AsyncSelectFilter
        title="Project"
        name="project"
        facet="project"
        facetOption={facetOption('uuid', 'name')}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        formatOptionLabel={(option) => <b>Project {option.name}</b>}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Project' }));
    expect(await screen.findByText('(18)')).toBeInTheDocument();
    expect(screen.getByText('Project p1')).toBeInTheDocument();
  });
});
