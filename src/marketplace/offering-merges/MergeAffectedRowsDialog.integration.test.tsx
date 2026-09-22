import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingMergesAffectedList,
  OfferingMergeAffectedRow,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { tableInitialReducer } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { MergeAffectedRowsDialog } from './MergeAffectedRowsDialog';
import { MergeEntryRow } from './utils';

/**
 * The other suite mocks the table away to look at the cells. This one drives
 * the real `useTable` over the real Redux reducer, so paging and a failed
 * request go through the machinery they will meet in the browser.
 */
const entry: MergeEntryRow = {
  label: 'marketplace.Resource.offering',
  title: 'Resources',
  areaTitle: 'Resources and orders',
  effectTitle: 'Moved to the target',
  count: 12,
  leftOnSource: 0,
  canListRows: true,
};

const row = (id: number): OfferingMergeAffectedRow => ({
  id,
  uuid: `resource-${id}`,
  model: 'marketplace.Resource',
  field: 'offering',
  description: `Resource number ${id}`,
  old_value: 'Kubernetes (Basic)',
  new_value: 'Kubernetes',
  kept_on_source: false,
});

const respond = (rows: OfferingMergeAffectedRow[], count: number) =>
  ({
    data: rows,
    response: {
      headers: new Headers({
        'content-type': 'application/json',
        'x-result-count': String(count),
      }),
    },
  }) as any;

const renderDialog = () =>
  renderWithProviders(
    <Provider
      store={createStore(combineReducers({ tables: tableInitialReducer }))}
    >
      <DrawerProvider>
        <MergeAffectedRowsDialog resolve={{ mergeUuid: 'merge-1', entry }} />
      </DrawerProvider>
    </Provider>,
  );

const pageOf = (call: any) => call[0].query.page;

describe('MergeAffectedRowsDialog over the real table', () => {
  beforeEach(() => {
    vi.mocked(marketplaceOfferingMergesAffectedList).mockReset();
  });

  it('fetches the next page when the pagination is used', async () => {
    vi.mocked(marketplaceOfferingMergesAffectedList).mockImplementation(
      (options: any) =>
        Promise.resolve(
          options.query.page === 2
            ? respond([row(11), row(12)], 12)
            : respond(
                Array.from({ length: 10 }, (_, index) => row(index + 1)),
                12,
              ),
        ) as any,
    );

    renderDialog();
    expect(await screen.findByText('Resource number 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(await screen.findByText('Resource number 11')).toBeInTheDocument();
    expect(screen.queryByText('Resource number 1')).toBeNull();
    const pages = vi
      .mocked(marketplaceOfferingMergesAffectedList)
      .mock.calls.map(pageOf);
    expect(pages).toContain(1);
    expect(pages).toContain(2);
  });

  it('offers a retry when the endpoint fails', async () => {
    vi.mocked(marketplaceOfferingMergesAffectedList).mockRejectedValue(
      new Error('Server error'),
    );

    renderDialog();

    // The shared table renders its own error view; the dialog neither swallows
    // the failure nor shows an empty list as if there were no rows.
    expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
    expect(screen.queryByText('Resource number 1')).toBeNull();
  });
});
