import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsList,
  openstackMigrationsCreate,
  openstackNetworksList,
  openstackSubnetsList,
  openstackVolumeTypesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';

import { MigrateTenantDialog } from './MigrateTenantDialog';

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
  return renderWithProviders(
    <MigrateTenantDialog
      resolve={{ resource: fakeResource, refetch: vi.fn() }}
    />,
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
    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockResponse([], 0) as any,
    );

    renderDialog();

    // Search and select offering
    await typeAndSelectOption(
      user,
      'Offering',
      'Target',
      /Target Offering | Target Customer/,
    );

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
    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockResponse([], 0) as any,
    );
    vi.mocked(openstackMigrationsCreate).mockResolvedValue({} as any);

    renderDialog();

    // Select offering
    await openAndSelectOption(
      user,
      'Offering',
      /Target Offering | Target Customer/,
    );

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
