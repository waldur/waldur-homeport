import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourceApiKeysCount,
  marketplaceResourceApiKeysUsageTotalsRetrieve,
} from 'waldur-js-client';

import { ProviderApiKeysSummary } from './ProviderApiKeysSummary';

const counted = (count: number) =>
  ({
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

describe('ProviderApiKeysSummary', () => {
  let client: QueryClient;
  const filter = { provider_uuid: 'provider' };

  const renderSummary = (tableLoading: boolean, query = filter) => (
    <QueryClientProvider client={client}>
      <ProviderApiKeysSummary filter={query} tableLoading={tableLoading} />
    </QueryClientProvider>
  );

  const totalsCalls = () =>
    vi.mocked(marketplaceResourceApiKeysUsageTotalsRetrieve).mock.calls.length;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(marketplaceResourceApiKeysCount).mockResolvedValue(counted(3));
    vi.mocked(marketplaceResourceApiKeysUsageTotalsRetrieve).mockResolvedValue({
      data: { usages: {}, estimated_cost: '1.00' },
    } as any);
  });

  it('marks the cost total as counting deleted keys too', async () => {
    render(renderSummary(false));
    await waitFor(() => expect(screen.getByText(/Keys: 3/)).toBeTruthy());
    expect(
      within(screen.getByTestId('provider-api-keys-summary')).getByTestId(
        'help-tip',
      ),
    ).toBeTruthy();
  });

  it('loads once while the rows load for the first time', async () => {
    const { rerender } = render(renderSummary(true));
    await waitFor(() => expect(screen.getByText(/Keys: 3/)).toBeTruthy());
    rerender(renderSummary(false));
    await waitFor(() => expect(totalsCalls()).toBe(1));
  });

  it('reloads when the rows are refreshed under the same filter', async () => {
    const { rerender } = render(renderSummary(false));
    await waitFor(() => expect(totalsCalls()).toBe(1));
    rerender(renderSummary(true));
    rerender(renderSummary(false));
    await waitFor(() => expect(totalsCalls()).toBe(2));
  });

  it('loads once for a new filter', async () => {
    const { rerender } = render(renderSummary(false));
    await waitFor(() => expect(totalsCalls()).toBe(1));
    const narrowed = { ...filter, state: ['OK' as const] };
    rerender(renderSummary(true, narrowed));
    await waitFor(() => expect(totalsCalls()).toBe(2));
    rerender(renderSummary(false, narrowed));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(totalsCalls()).toBe(2);
  });
});
