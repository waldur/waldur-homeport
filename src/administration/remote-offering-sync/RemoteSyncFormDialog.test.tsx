import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoriesList,
  marketplaceRemoteSynchronisationsCreate,
  marketplaceRemoteSynchronisationsUpdate,
  marketplaceServiceProvidersList,
  remoteWaldurApiRemoteCategories,
  remoteWaldurApiRemoteCustomers,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import {
  openAndSelectOption,
  openAndSelectOptionInContainer,
  typeAndSelectOption,
} from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { RemoteSyncFormDialog } from './RemoteSyncFormDialog';

const remoteCustomers = [{ uuid: 'remote-cust-1', name: 'Remote Customer 1' }];

const remoteCategories = [{ uuid: 'remote-cat-1', title: 'Remote Category 1' }];

describe('RemoteSyncFormDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(remoteWaldurApiRemoteCustomers).mockResolvedValue({
      data: remoteCustomers,
    } as any);
    vi.mocked(remoteWaldurApiRemoteCategories).mockResolvedValue({
      data: remoteCategories,
    } as any);
    vi.mocked(marketplaceServiceProvidersList).mockResolvedValue(
      mockListResponse([
        { url: 'local-sp-url', customer_name: 'Local Provider' },
      ]),
    );
    vi.mocked(marketplaceCategoriesList).mockResolvedValue(
      mockListResponse([{ url: 'local-cat-url', title: 'Local Category' }]),
    );
  });

  const renderDialog = (remoteSync?: any) =>
    renderWithProviders(
      <RemoteSyncFormDialog remoteSync={remoteSync} refetch={mockRefetch} />,
    );

  it('renders "Add" title when creating', () => {
    renderDialog();
    expect(screen.getByText('Add remote synchronization')).toBeDefined();
  });

  it('renders "Edit" title when editing', () => {
    renderDialog({
      uuid: 'sync-1',
      api_url: 'url',
      token: 'token',
      remotelocalcategory_set: [],
    });
    expect(screen.getByText('Edit remote synchronization')).toBeDefined();
  });

  it('performs create successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceRemoteSynchronisationsCreate).mockResolvedValue(
      {} as any,
    );

    renderDialog();

    // Fill credentials
    await user.type(
      screen.getByLabelText(/Remote API URL/),
      'https://remote.waldur.com',
    );
    await user.type(
      screen.getByLabelText(/Authentication token/),
      'secret-token',
    );

    await waitFor(() => {
      expect(remoteWaldurApiRemoteCustomers).toHaveBeenCalled();
    });

    // Wait for connecting to finish
    await waitFor(() => {
      expect(screen.queryByText(/Connecting/)).toBeNull();
    });

    // Select remote organization
    await openAndSelectOption(user, 'Remote organization', 'Remote Customer 1');

    // Select local provider
    await typeAndSelectOption(
      user,
      'Local service provider',
      'Local',
      'Local Provider',
    );

    // Category mapping
    await openAndSelectOptionInContainer(
      user,
      screen.getByTestId('remote-category-col'),
      'Remote Category 1',
    );
    const localCatContainer = screen.getByTestId('local-category-col');
    const localCatCombobox = within(localCatContainer).getByRole('combobox');
    await user.click(localCatCombobox);
    await user.type(localCatCombobox, 'Local');
    await user.click(
      await screen.findByRole('option', { name: /Local Category/ }),
    );

    // Toggle active
    await user.click(screen.getByLabelText('Enable synchronization'));

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Create' });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceRemoteSynchronisationsCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          api_url: 'https://remote.waldur.com',
          token: 'secret-token',
          is_active: true,
          remote_organization_uuid: 'remote-cust-1',
          local_service_provider: 'local-sp-url',
        }),
      });
    });

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Remote synchronization added successfully',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('performs update successfully', async () => {
    const user = userEvent.setup();
    const existingSync = {
      uuid: 'sync-uuid',
      api_url: 'https://old.url',
      token: 'old-token',
      is_active: false,
      local_service_provider: 'local-sp-url',
      local_service_provider_name: 'Local Provider',
      remote_organization_uuid: 'remote-cust-1',
      remote_organization_name: 'Remote Customer 1',
      remotelocalcategory_set: [
        {
          remote_category: 'remote-cat-1',
          remote_category_name: 'Remote Category 1',
          local_category: 'local-cat-url',
          local_category_name: 'Local Category',
        },
      ],
    };
    vi.mocked(marketplaceRemoteSynchronisationsUpdate).mockResolvedValue(
      {} as any,
    );

    renderDialog(existingSync);

    // Change URL
    const urlInput = screen.getByLabelText(/Remote API URL/);
    await user.clear(urlInput);
    await user.type(urlInput, 'https://new.url');

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceRemoteSynchronisationsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'sync-uuid' },
        body: expect.objectContaining({
          api_url: 'https://new.url',
        }),
      });
    });

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Remote synchronization has been updated.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('displays error message when connection fails', async () => {
    const user = userEvent.setup();
    vi.mocked(remoteWaldurApiRemoteCustomers).mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } },
    });

    renderDialog();

    await user.type(screen.getByLabelText(/Remote API URL/), 'invalid-url');
    await user.type(
      screen.getByLabelText(/Authentication token/),
      'invalid-token',
    );

    await waitFor(() => {
      expect(remoteWaldurApiRemoteCustomers).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeDefined();
    });
  });
});
