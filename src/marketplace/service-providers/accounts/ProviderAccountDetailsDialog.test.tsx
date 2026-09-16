import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceOfferingUsersList,
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProviderAccountDetailsDialog } from './ProviderAccountDetailsDialog';

const account = {
  uuid: 'account-1',
  user_uuid: 'user-1',
  username: 'jdoe',
  state: 'OK',
  is_restricted: false,
  created: '2024-01-01T00:00:00Z',
} as any;

const renderDialog = () =>
  renderWithProviders(
    <ProviderAccountDetailsDialog
      resolve={{ account, providerCustomerUuid: 'customer-1' }}
    />,
  );

describe('ProviderAccountDetailsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceProviderOfferingsUserAttributeConfigRetrieve,
    ).mockResolvedValue({
      data: { exposed_fields: ['email', 'identity_source'] },
    } as any);
  });

  it("shows the identity attributes one of the person's offering accounts exposes", async () => {
    vi.mocked(marketplaceOfferingUsersList).mockResolvedValue({
      data: [
        {
          offering_uuid: 'offering-1',
          user_email: 'jane@example.com',
          user_identity_source: 'eduGAIN',
        },
      ],
    } as any);

    renderDialog();

    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('eduGAIN')).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(marketplaceOfferingUsersList).toHaveBeenCalledWith({
      query: {
        provider_uuid: 'customer-1',
        user_uuid: 'user-1',
        page_size: 1,
      },
    });
    expect(
      marketplaceProviderOfferingsUserAttributeConfigRetrieve,
    ).toHaveBeenCalledWith({ path: { uuid: 'offering-1' } });
  });

  it('says so when the person has no offering account to read from', async () => {
    vi.mocked(marketplaceOfferingUsersList).mockResolvedValue({
      data: [],
    } as any);

    renderDialog();

    expect(
      await screen.findByText('None exposed to this provider'),
    ).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(
      marketplaceProviderOfferingsUserAttributeConfigRetrieve,
    ).not.toHaveBeenCalled();
  });
});
