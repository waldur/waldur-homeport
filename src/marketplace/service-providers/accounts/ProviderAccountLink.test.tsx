import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { isProviderBacked, ProviderAccountButton } from './ProviderAccountLink';

const openDialog = vi.fn();

const backed = {
  uuid: 'ou-1',
  customer_uuid: 'provider-customer',
  service_provider_account_uuid: 'account-1',
  service_provider_account_username: 'jdoe',
} as any;

const own = {
  uuid: 'ou-2',
  customer_uuid: 'provider-customer',
  service_provider_account_uuid: null,
  service_provider_account_username: null,
} as any;

describe('isProviderBacked', () => {
  it('follows the link, not the offering or provider scope', () => {
    expect(isProviderBacked(backed)).toBe(true);
    expect(isProviderBacked(own)).toBe(false);
    expect(isProviderBacked(undefined)).toBe(false);
  });
});

describe('ProviderAccountButton', () => {
  beforeEach(() => {
    openDialog.mockClear();
    vi.mocked(useModal).mockReturnValue({ openDialog } as any);
  });

  it('is absent on an offering account of its own', () => {
    renderWithProviders(<ProviderAccountButton row={own} />);
    expect(screen.queryByTestId('provider-account-link')).toBeNull();
  });

  it('opens the provider account the offering account reads through', async () => {
    renderWithProviders(<ProviderAccountButton row={backed} />);

    await userEvent.click(screen.getByTestId('provider-account-link'));

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(openDialog.mock.calls[0][1].resolve).toEqual({
      accountUuid: 'account-1',
      providerCustomerUuid: 'provider-customer',
    });
  });
});
