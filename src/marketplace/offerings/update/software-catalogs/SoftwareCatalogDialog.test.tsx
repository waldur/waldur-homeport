import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsAddSoftwareCatalog,
  marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate,
  marketplaceSoftwareCatalogsCpuTargetsList,
  marketplaceSoftwareCatalogsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import {
  clearSelect,
  openAndSelectOption,
  typeAndSelectOption,
} from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { SoftwareCatalogDialog } from './SoftwareCatalogDialog';

const mockOffering: any = {
  uuid: 'offering-uuid',
  partitions: [
    { uuid: 'partition1-uuid', partition_name: 'Partition 1' },
    { uuid: 'partition2-uuid', partition_name: 'Partition 2' },
  ],
};

const mockSpackCatalog: any = {
  uuid: 'spack-catalog-uuid',
  name: 'Test Catalog',
  version: '1.0',
  package_count: 100,
  catalog_type_display: 'Spack',
  supports_cpu_target_restrictions: false,
};

const mockEessiCatalog: any = {
  uuid: 'eessi-catalog-uuid',
  name: 'EESSI',
  version: '2025.06',
  package_count: 3401,
  catalog_type_display: 'Binary Runtime (EESSI)',
  supports_cpu_target_restrictions: true,
};

const mockEessiCatalogB: any = {
  uuid: 'eessi-catalog-b-uuid',
  name: 'EESSI',
  version: '2023.06',
  package_count: 2100,
  catalog_type_display: 'Binary Runtime (EESSI)',
  supports_cpu_target_restrictions: true,
};

const mockSpackLink: any = {
  uuid: 'software-catalog-uuid',
  catalog: mockSpackCatalog,
  enabled_cpu_family: ['x86_64'],
  enabled_cpu_microarchitectures: ['zen3'],
  partition: { uuid: 'partition1-uuid', partition_name: 'Partition 1' },
};

const mockEessiLink: any = {
  uuid: 'eessi-link-uuid',
  catalog: mockEessiCatalog,
  enabled_cpu_family: ['x86_64'],
  enabled_cpu_microarchitectures: ['zen3'],
  partition: { uuid: 'partition1-uuid', partition_name: 'Partition 1' },
};

const mockCpuTargets = [
  {
    cpu_family: 'x86_64',
    cpu_microarchitecture: 'amd/zen3',
    full_arch: 'x86_64/amd/zen3',
  },
  {
    cpu_family: 'aarch64',
    cpu_microarchitecture: 'neoverse_v1',
    full_arch: 'aarch64/neoverse_v1',
  },
];

const renderComponent = (
  mode: 'add' | 'edit' = 'add',
  softwareCatalog = mockSpackLink,
) =>
  renderWithProviders(
    <SoftwareCatalogDialog
      resolve={{
        mode,
        offering: mockOffering,
        softwareCatalog: mode === 'edit' ? softwareCatalog : undefined,
        refetch: vi.fn(),
      }}
    />,
  );

describe('SoftwareCatalogDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceSoftwareCatalogsList).mockResolvedValue(
      mockListResponse([mockSpackCatalog, mockEessiCatalog, mockEessiCatalogB]),
    );
    vi.mocked(marketplaceSoftwareCatalogsCpuTargetsList).mockResolvedValue({
      data: mockCpuTargets,
    } as any);
  });

  it('renders "add" mode correctly', () => {
    renderComponent('add');
    expect(screen.getByText('Add software catalog')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders "edit" mode for Spack without CPU restriction fields', () => {
    renderComponent('edit');
    expect(screen.getByText('Edit software catalog')).toBeInTheDocument();
    expect(
      screen.getByText(/Test Catalog 1.0 \(100 packages\) - Spack/),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Enabled CPU family'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Partition 1')).toBeInTheDocument();
  });

  it('submits "add" form for Spack without CPU restrictions', async () => {
    const user = userEvent.setup();
    const mockAdd = vi
      .mocked(marketplaceProviderOfferingsAddSoftwareCatalog)
      .mockResolvedValue({} as any);

    renderComponent('add');

    await typeAndSelectOption(user, 'Software catalog', 'Test', /Test Catalog/);
    await openAndSelectOption(user, 'Partition', 'Partition 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            catalog: 'spack-catalog-uuid',
            enabled_cpu_family: [],
            enabled_cpu_microarchitectures: [],
            partition: 'partition1-uuid',
          }),
        }),
      );
    });
  });

  it('loads CPU targets for EESSI catalogs', async () => {
    const user = userEvent.setup();
    renderComponent('add');

    await typeAndSelectOption(user, 'Software catalog', 'EESSI', /EESSI 2025/);

    await waitFor(() => {
      expect(marketplaceSoftwareCatalogsCpuTargetsList).toHaveBeenCalledWith({
        path: { uuid: 'eessi-catalog-uuid' },
      });
    });

    expect(screen.getByLabelText('Enabled CPU family')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Enabled CPU microarchitecture'),
    ).toBeInTheDocument();
  });

  it('submits "add" form for EESSI with selected CPU targets', async () => {
    const user = userEvent.setup();
    const mockAdd = vi
      .mocked(marketplaceProviderOfferingsAddSoftwareCatalog)
      .mockResolvedValue({} as any);

    renderComponent('add');

    await typeAndSelectOption(user, 'Software catalog', 'EESSI', /EESSI 2025/);
    await openAndSelectOption(user, 'Enabled CPU family', 'x86_64');
    await openAndSelectOption(
      user,
      'Enabled CPU microarchitecture',
      'x86_64/amd/zen3',
    );
    await openAndSelectOption(user, 'Partition', 'Partition 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            catalog: 'eessi-catalog-uuid',
            enabled_cpu_family: ['x86_64'],
            enabled_cpu_microarchitectures: ['amd/zen3'],
            partition: 'partition1-uuid',
          }),
        }),
      );
    });
  });

  it('clears CPU selections when switching between EESSI catalogs', async () => {
    const user = userEvent.setup();
    const mockAdd = vi
      .mocked(marketplaceProviderOfferingsAddSoftwareCatalog)
      .mockResolvedValue({} as any);

    renderComponent('add');

    await typeAndSelectOption(user, 'Software catalog', '2025', /EESSI 2025/);
    await openAndSelectOption(user, 'Enabled CPU family', 'x86_64');
    await openAndSelectOption(
      user,
      'Enabled CPU microarchitecture',
      'x86_64/amd/zen3',
    );

    await typeAndSelectOption(user, 'Software catalog', '2023', /EESSI 2023/);
    await openAndSelectOption(user, 'Partition', 'Partition 1');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            catalog: 'eessi-catalog-b-uuid',
            enabled_cpu_family: [],
            enabled_cpu_microarchitectures: [],
          }),
        }),
      );
    });
  });

  it('drops microarchitectures that do not match the selected family', async () => {
    const user = userEvent.setup();
    const mockAdd = vi
      .mocked(marketplaceProviderOfferingsAddSoftwareCatalog)
      .mockResolvedValue({} as any);

    renderComponent('add');

    await typeAndSelectOption(user, 'Software catalog', 'EESSI', /EESSI 2025/);
    await openAndSelectOption(user, 'Enabled CPU family', 'x86_64');
    await openAndSelectOption(
      user,
      'Enabled CPU microarchitecture',
      'x86_64/amd/zen3',
    );
    await clearSelect(user, 'Enabled CPU family');
    await openAndSelectOption(user, 'Enabled CPU family', 'aarch64');
    await openAndSelectOption(user, 'Partition', 'Partition 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            enabled_cpu_family: ['aarch64'],
            enabled_cpu_microarchitectures: [],
          }),
        }),
      );
    });
  });

  it('shows a retry state when CPU targets fail to load', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceSoftwareCatalogsCpuTargetsList).mockRejectedValue(
      new Error('network'),
    );

    renderComponent('add');
    await typeAndSelectOption(user, 'Software catalog', 'EESSI', /EESSI 2025/);

    expect(
      await screen.findByText('Unable to load CPU targets.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(
      screen.queryByText(/No CPU targets are available/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Enabled CPU family'),
    ).not.toBeInTheDocument();
  });

  it('shows an empty-map message when CPU targets load with no options', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceSoftwareCatalogsCpuTargetsList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent('add');
    await typeAndSelectOption(user, 'Software catalog', 'EESSI', /EESSI 2025/);

    expect(
      await screen.findByText(/No CPU targets are available/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Unable to load CPU targets.'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Enabled CPU family')).toBeInTheDocument();
  });

  it('maps legacy short CPU tokens to catalog targets when editing an EESSI catalog', async () => {
    const user = userEvent.setup();
    const mockUpdate = vi
      .mocked(marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate)
      .mockResolvedValue({} as any);

    renderComponent('edit', mockEessiLink);

    await waitFor(() => {
      expect(marketplaceSoftwareCatalogsCpuTargetsList).toHaveBeenCalledWith({
        path: { uuid: 'eessi-catalog-uuid' },
      });
    });
    await screen.findByText('x86_64/amd/zen3');
    expect(screen.queryByText(/Removed saved values/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering_catalog_uuid: 'eessi-link-uuid',
            enabled_cpu_family: ['x86_64'],
            enabled_cpu_microarchitectures: ['amd/zen3'],
          }),
        }),
      );
    });
  });

  it('warns about saved CPU values the catalog version does not provide', async () => {
    const user = userEvent.setup();
    const mockUpdate = vi
      .mocked(marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate)
      .mockResolvedValue({} as any);

    renderComponent('edit', {
      ...mockEessiLink,
      enabled_cpu_microarchitectures: ['zen3', 'cascadelake'],
    });

    expect(
      await screen.findByText(/Removed saved values .*: cascadelake\./),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            enabled_cpu_microarchitectures: ['amd/zen3'],
          }),
        }),
      );
    });
  });

  it('keeps saved CPU values when the catalog version has no CPU targets', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceSoftwareCatalogsCpuTargetsList).mockResolvedValue({
      data: [],
    } as any);
    const mockUpdate = vi
      .mocked(marketplaceProviderOfferingsUpdateSoftwareCatalogPartialUpdate)
      .mockResolvedValue({} as any);

    renderComponent('edit', mockEessiLink);

    expect(
      await screen.findByText(/No CPU targets are available/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            enabled_cpu_family: ['x86_64'],
            enabled_cpu_microarchitectures: ['zen3'],
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

    await openAndSelectOption(user, 'Partition', 'Partition 2');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            offering_catalog_uuid: 'software-catalog-uuid',
            enabled_cpu_family: [],
            enabled_cpu_microarchitectures: [],
            partition: 'partition2-uuid',
          }),
        }),
      );
    });
  });
});
