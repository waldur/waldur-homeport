import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalRequestedResourcesList } from 'waldur-js-client';
import { createTablesStore } from 'waldur-table';
import { ModalProvider } from 'waldur-ui';

import { ProposalsPage } from './ProposalsPage';

const listMock = vi.mocked(proposalRequestedResourcesList);

const row = {
  uuid: 'resource-1',
  proposal_uuid: 'proposal-1',
  proposal_name: 'Protein folding',
  proposal_slug: 'pf-1',
  call_name: 'Spring call',
  round_name: 'Round 1',
  offering_name: 'HPC cluster',
  limits: { cpu: 100 },
  proposal_state: 'submitted',
};

const lastQuery = () => listMock.mock.calls.at(-1)[0].query as any;

// What main.tsx and AppShell put around a page.
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <Provider store={createTablesStore()}>
      <ModalProvider>{children}</ModalProvider>
    </Provider>
  </QueryClientProvider>
);

describe('ProposalsPage', () => {
  beforeEach(() => {
    listMock.mockReset();
    listMock.mockResolvedValue({
      data: [row],
      response: {
        headers: new Headers({
          'content-type': 'application/json',
          'x-result-count': '25',
        }),
      },
    } as any);
  });

  it('fetches one page of the provider’s proposals, newest first', async () => {
    render(<ProposalsPage provider={{ uuid: 'provider-1' } as any} />, {
      wrapper,
    });
    expect(await screen.findByText('Protein folding')).toBeTruthy();
    const query = lastQuery();
    expect(query).toMatchObject({
      page: 1,
      page_size: 10,
      provider_uuid: 'provider-1',
      o: '-created',
    });
    // Every field of the row: the columns are not optional ones.
    expect(query.field).toBeUndefined();
  });

  it('sorts on the server when a column header is clicked', async () => {
    render(<ProposalsPage provider={{ uuid: 'provider-1' } as any} />, {
      wrapper,
    });
    await screen.findByText('Protein folding');
    await userEvent.click(
      screen.getByRole('button', { name: /^Offering: not sorted/ }),
    );
    await waitFor(() => expect(lastQuery().o).toBe('offering__name'));
  });

  it('searches on the server', async () => {
    render(<ProposalsPage provider={{ uuid: 'provider-1' } as any} />, {
      wrapper,
    });
    await screen.findByText('Protein folding');
    await userEvent.type(screen.getByRole('searchbox'), 'fold');
    await waitFor(() => expect(lastQuery().query).toBe('fold'));
  });
});
