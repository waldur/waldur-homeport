import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingTermsOfServiceList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { TosEditDialog } from './TosEditDialog';

const activeTos = {
  uuid: 'active-uuid',
  offering_uuid: 'offering-uuid',
  version: '1.0',
  terms_of_service: '# Terms v1',
  is_active: true,
};

const inactiveTos = {
  uuid: 'inactive-uuid',
  offering_uuid: 'offering-uuid',
  version: '2.0',
  terms_of_service: '# Terms v2',
  is_active: false,
};

const renderDialog = (tos) =>
  renderWithProviders(<TosEditDialog resolve={{ tos, refetch: vi.fn() }} />);

describe('TosEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceOfferingTermsOfServiceList).mockResolvedValue({
      data: [activeTos],
    } as any);
  });

  it('warns when activating another version', async () => {
    const user = userEvent.setup();
    renderDialog(inactiveTos);

    await user.click(screen.getByRole('checkbox', { name: /Active/i }));

    expect(
      await screen.findByText('Version 1.0 will be deactivated'),
    ).toBeInTheDocument();
  });

  it('does not warn when editing the version that is already active', async () => {
    renderDialog(activeTos);

    await waitFor(() =>
      expect(marketplaceOfferingTermsOfServiceList).toHaveBeenCalled(),
    );
    expect(screen.queryByText(/will be deactivated/)).not.toBeInTheDocument();
  });
});
