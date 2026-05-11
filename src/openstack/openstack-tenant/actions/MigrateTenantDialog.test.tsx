import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsList,
  openstackMigrationsCreate,
  openstackNetworksList,
  openstackVolumeTypesList,
} from 'waldur-js-client';

import { MigrateTenantDialog } from './MigrateTenantDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    openstackMigrationsCreate: vi.fn(),
    openstackNetworksList: vi.fn(),
    marketplacePublicOfferingsList: vi.fn(),
    openstackVolumeTypesList: vi.fn(),
  };
});

const fakeResource = {
  uuid: 'resource-uuid',
  name: 'Test Tenant',
  marketplace_resource_uuid: 'marketplace-uuid',
  customer_uuid: 'customer-uuid',
};

const fakeOffering = {
  uuid: 'offering-uuid',
  name: 'Target Offering',
  customer_name: 'Target Customer',
  plans: [{ uuid: 'plan-uuid', name: 'Default Plan' }],
  scope_uuid: 'settings-uuid',
};

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MigrateTenantDialog
          resolve={{ resource: fakeResource, refetch: vi.fn() }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

const mockResponse = (data, count = 0) => ({
  data,
  response: {
    headers: {
      get: (name) =>
        name.toLowerCase() === 'x-result-count' ? count.toString() : null,
    },
  },
});

describe('MigrateTenantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial values', () => {
    renderDialog();
    expect(
      screen.getByText('Replicate tenant to another OpenStack deployment'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Tenant')).toBeInTheDocument();
  });

  it('shows dependent fields after selecting an offering', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockResponse([fakeOffering], 1) as any,
    );
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockResponse([], 0) as any,
    );
    vi.mocked(openstackNetworksList).mockResolvedValue(
      mockResponse([], 0) as any,
    );

    renderDialog();

    // Search and select offering
    const offeringSelect = screen
      .getByText('Select...')
      .closest('.metronic-select-container')
      .querySelector('input');
    await user.click(offeringSelect);
    await user.type(offeringSelect, 'Target');
    const option = await screen.findByText(/Target Offering | Target Customer/);
    await user.click(option);

    // Check dependent fields
    expect(await screen.findByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Volume types')).toBeInTheDocument();
    expect(screen.getByText('Networks')).toBeInTheDocument();
    expect(screen.getByText('Subnets')).toBeInTheDocument();
  });

  it('submits correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockResponse([fakeOffering], 1) as any,
    );
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockResponse([], 0) as any,
    );
    vi.mocked(openstackNetworksList).mockResolvedValue(
      mockResponse([], 0) as any,
    );
    vi.mocked(openstackMigrationsCreate).mockResolvedValue({} as any);

    renderDialog();

    // Select offering
    const offeringSelect = screen
      .getByText('Select...')
      .closest('.metronic-select-container')
      .querySelector('input');
    await user.click(offeringSelect);
    const option = await screen.findByText(/Target Offering | Target Customer/);
    await user.click(option);

    // Wait for plan to be auto-selected and rendered
    await screen.findByText('Plan');

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackMigrationsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'Test Tenant',
            dst_offering: 'offering-uuid',
            dst_plan: 'plan-uuid',
          }),
        }),
      );
    });
  });
});
