import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoriesList,
  remoteWaldurApiImportOffering,
  remoteWaldurApiRemoteCustomers,
  remoteWaldurApiSharedOfferings,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import {
  openAndSelectOption,
  openAndSelectOptionInContainer,
} from '@/test/select';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { RemoteOfferingImportDialog } from './RemoteOfferingImportDialog';

const renderDialog = (refetch = vi.fn()) => {
  return renderWithProviders(<RemoteOfferingImportDialog refetch={refetch} />);
};

describe('RemoteOfferingImportDialog', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
      uuid: 'local-customer-uuid',
    } as any);

    vi.clearAllMocks();
  });

  const getNextButton = () =>
    screen
      .queryAllByRole('button', { name: /Next/i })
      .find((b) => b.textContent === 'Next');
  const getConfirmButton = () =>
    screen
      .queryAllByRole('button', { name: /Confirm/i })
      .find((b) => b.textContent === 'Confirm');

  const walkThroughWizard = async (user) => {
    // --- Step 1: Credentials ---
    await user.type(
      screen.getByRole('textbox', { name: /API URL/i }),
      'api.example.com',
    );
    await user.type(screen.getByLabelText(/Authentication token/i), 'secret');
    await user.click(getNextButton());

    // --- Step 2: Organization ---
    await screen.findByText(/Select organization/i);
    await openAndSelectOption(user, /Organization/i, 'Remote Customer');
    await user.click(getNextButton());

    // --- Step 3: Offerings ---
    await screen.findByText(/Choose offerings/i);
    await openAndSelectOption(user, /Offerings/i, 'Remote Offering');
    await user.click(getNextButton());

    // --- Step 4: Categories ---
    await screen.findByText(/Map categories/i);
    const categoryRow = screen.getByRole('row', { name: /Compute/i });
    await openAndSelectOptionInContainer(user, categoryRow, 'Local Compute');

    await waitFor(() => expect(getNextButton()).not.toBeDisabled());
    await user.click(getNextButton());

    // --- Step 5: Review ---
    await screen.findByText(/Review and confirm/i);
  };

  it('walks through the wizard and handles success and error cases', async () => {
    const user = userEvent.setup();

    // Mocks for successful run
    vi.mocked(remoteWaldurApiRemoteCustomers).mockResolvedValue({
      data: [{ uuid: 'remote-customer-uuid', name: 'Remote Customer' }],
    } as any);
    vi.mocked(remoteWaldurApiSharedOfferings).mockResolvedValue({
      data: [
        {
          uuid: 'remote-offering-uuid',
          name: 'Remote Offering',
          category_title: 'Compute',
          type: 'Standard',
        },
      ],
    } as any);
    vi.mocked(marketplaceCategoriesList).mockResolvedValue(
      mockListResponse([
        { uuid: 'local-category-uuid', title: 'Local Compute' },
      ]),
    );
    vi.mocked(remoteWaldurApiImportOffering).mockResolvedValue({
      data: { uuid: 'imported-offering-uuid' },
    } as any);

    const { unmount } = renderDialog();
    await walkThroughWizard(user);
    await user.click(getConfirmButton());
    await waitFor(() => {
      expect(remoteWaldurApiImportOffering).toHaveBeenCalledWith({
        body: expect.objectContaining({
          api_url: 'api.example.com',
          token: 'secret',
          remote_offering_uuid: 'remote-offering-uuid',
          remote_customer_uuid: 'remote-customer-uuid',
          local_category_uuid: 'local-category-uuid',
          local_customer_uuid: 'local-customer-uuid',
        }),
      });
    });
    expect(useNotify().showSuccess).toHaveBeenCalled();
    unmount();

    // Now test error handling (in a new render)
    const error = new Error('Submission failed');
    vi.mocked(remoteWaldurApiImportOffering).mockRejectedValue(error);
    renderDialog();
    await walkThroughWizard(user);
    await user.click(getConfirmButton());
    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        expect.any(String),
      ),
    );
  });
});
