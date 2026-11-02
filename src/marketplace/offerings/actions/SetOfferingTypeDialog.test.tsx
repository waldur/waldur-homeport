import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateType } from 'waldur-js-client';

import { LEGACY_SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import { BASIC_OFFERING_TYPE } from '@/support/constants';
import { renderWithProviders } from '@/test/harness';

import { SetOfferingTypeDialog } from './SetOfferingTypeDialog';

const submit = async (type: string) => {
  const offering: any = { uuid: 'offering-uuid', name: 'Offering', type };
  renderWithProviders(
    <SetOfferingTypeDialog resolve={{ offering, refetch: vi.fn() }} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() =>
    expect(marketplaceProviderOfferingsUpdateType).toHaveBeenCalled(),
  );
};

describe('SetOfferingTypeDialog', () => {
  beforeEach(() => {
    vi.mocked(marketplaceProviderOfferingsUpdateType).mockResolvedValue({
      data: {},
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('turns a Basic offering into a site agent one under the current name', async () => {
    await submit(BASIC_OFFERING_TYPE);
    expect(marketplaceProviderOfferingsUpdateType).toHaveBeenCalledWith({
      path: { uuid: 'offering-uuid' },
      body: { type: 'Marketplace.SiteAgent' },
    });
  });

  it('turns an offering under the former name into a Basic one', async () => {
    await submit(LEGACY_SITE_AGENT_PLUGIN);
    expect(marketplaceProviderOfferingsUpdateType).toHaveBeenCalledWith({
      path: { uuid: 'offering-uuid' },
      body: { type: BASIC_OFFERING_TYPE },
    });
  });
});
