import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsResourcesList } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { ResourceRequestsSummary } from './ResourceRequestsSummary';

const proposal = { uuid: 'proposal-1', call_uuid: 'call-1' } as any;

const requests = [
  {
    uuid: 'req-1',
    requested_offering: {
      uuid: 'call-offering-hpc',
      offering_name: 'HPC Standard Allocation with a rather long offering name',
      components: [],
      plan_details: null,
    },
    limits: {},
    attributes: {},
  },
];

const renderSummary = () =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>
        <ResourceRequestsSummary proposal={proposal} />
      </Provider>
    </DrawerProvider>,
  );

describe('ResourceRequestsSummary', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsResourcesList).mockImplementation(
      () =>
        Promise.resolve({
          data: requests,
          response: new Response(null, {
            headers: {
              'content-type': 'application/json',
              'x-result-count': '1',
            },
          }),
        }) as any,
    );
  });

  // Beside the progress rail the card is narrower than the columns' default
  // floors add up to; the table has to fit it rather than scroll sideways.
  it('fits its columns to the card and wraps their cells', async () => {
    renderSummary();
    await userEvent.click(screen.getByText('Resource requests'));

    // Once in the header summary, once in its row.
    await screen.findAllByText(
      'HPC Standard Allocation with a rather long offering name',
    );

    // Column widths live on <col> elements, which have no accessible role.
    // eslint-disable-next-line testing-library/no-node-access
    const cols = Array.from(screen.getByRole('table').querySelectorAll('col'));
    expect(cols.map((col) => col.style.width).filter(Boolean)).toEqual([
      '28%',
      '18%',
      '18%',
      '14%',
      '22%',
    ]);
    expect(cols.map((col) => col.style.minWidth).filter(Boolean)).toEqual([]);
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell).not.toHaveClass('ellipsis');
    }
  });
});
