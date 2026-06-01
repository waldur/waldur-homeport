import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsAddSoftwareCatalog,
  marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate,
  marketplaceSoftwareCatalogsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { SoftwareCatalogDialog } from './SoftwareCatalogDialog';

const mockOffering: any = {
  uuid: 'offering-uuid',
  partitions: [
    { uuid: 'partition1-uuid', partition_name: 'Partition 1' },
    { uuid: 'partition2-uuid', partition_name: 'Partition 2' },
  ],
};

const mockCatalog: any = {
  uuid: 'catalog-uuid',
  name: 'Test Catalog',
  version: '1.0',
  package_count: 100,
  catalog_type_display: 'Spack',
};

const mockSoftwareCatalog: any = {
  uuid: 'software-catalog-uuid',
  catalog: mockCatalog,
  enabled_cpu_family: ['x86_64'],
  enabled_cpu_microarchitectures: ['zen3'],
  partition: { uuid: 'partition1-uuid', partition_name: 'Partition 1' },
};

const mockProps = (mode: 'add' | 'edit') => ({
  resolve: {
    mode,
    offering: mockOffering,
    softwareCatalog: mode === 'edit' ? mockSoftwareCatalog : undefined,
    refetch: vi.fn(),
  },
});

const renderComponent = (mode: 'add' | 'edit' = 'add') => {
  return renderWithProviders(<SoftwareCatalogDialog {...mockProps(mode)} />);
};

describe('SoftwareCatalogDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceSoftwareCatalogsList).mockResolvedValue(
      mockListResponse([mockCatalog]),
    );
  });

  it('renders "add" mode correctly', () => {
    renderComponent('add');
    expect(screen.getByText('Add software catalog')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders "edit" mode correctly', () => {
    renderComponent('edit');
    expect(screen.getByText('Edit software catalog')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    // Check if initial values are populated
    expect(
      screen.getByText(/Test Catalog 1.0 \(100 packages\) - Spack/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Intel\/AMD 64-bit architecture/),
    ).toBeInTheDocument();
    expect(screen.getByText(/AMD Zen3 architecture/)).toBeInTheDocument();
    expect(screen.getByText('Partition 1')).toBeInTheDocument();
  });

  it('submits "add" form successfully', async () => {
    const user = userEvent.setup();
    const mockAdd = vi
      .mocked(marketplaceProviderOfferingsAddSoftwareCatalog)
      .mockResolvedValue({} as any);

    renderComponent('add');

    // Fill the form
    await typeAndSelectOption(user, 'Software catalog', 'Test', /Test Catalog/);
    await openAndSelectOption(
      user,
      'Enabled CPU family',
      'Intel/AMD 64-bit architecture',
    );
    await openAndSelectOption(user, 'Partition', 'Partition 1');

    const submitButton = screen.getByRole('button', { name: 'Add' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            catalog: 'catalog-uuid',
            enabled_cpu_family: ['x86_64'],
            partition: 'partition1-uuid',
          }),
        }),
      );
    });
  });

  it('submits "edit" form successfully', async () => {
    const user = userEvent.setup();
    const mockUpdate = vi
      .mocked(marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate)
      .mockResolvedValue({} as any);

    renderComponent('edit');

    // Change some values
    await openAndSelectOption(user, 'Partition', 'Partition 2');

    const submitButton = screen.getByRole('button', { name: 'Update' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            offering_catalog_uuid: 'software-catalog-uuid',
            partition: 'partition2-uuid',
          }),
        }),
      );
    });
  });
});
