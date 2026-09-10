import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsSync } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { VMWARE_VM } from '@/vmware/constants';

import { SyncButton } from './SyncButton';

const makeOffering = (overrides = {}) =>
  ({
    uuid: 'offering-uuid',
    type: VMWARE_VM,
    scope: 'https://example.com/api/service-settings/s1/',
    scope_state: 'ERRED',
    ...overrides,
  }) as any;

describe('SyncButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceProviderOfferingsSync).mockResolvedValue({
      data: {},
    } as any);
  });

  it('lets a vSphere offering recover from ERRED by synchronising', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SyncButton offering={makeOffering()} refetch={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /Synchronize/ }));

    await waitFor(() =>
      expect(marketplaceProviderOfferingsSync).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
      }),
    );
  });

  it('is not rendered for plugins that do not support synchronisation', () => {
    renderWithProviders(
      <SyncButton
        offering={makeOffering({ type: 'Marketplace.Basic' })}
        refetch={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /Synchronize/ }),
    ).not.toBeInTheDocument();
  });

  it('is not rendered for an offering without service settings', () => {
    renderWithProviders(
      <SyncButton offering={makeOffering({ scope: null })} refetch={vi.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: /Synchronize/ }),
    ).not.toBeInTheDocument();
  });
});
