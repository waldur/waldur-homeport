import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackFlavorsList } from 'waldur-js-client';

import { useModal } from '@/modal/actions';

import { K8sFlavorSelectionTable } from './K8sFlavorSelectionTable';

const tableOptions = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('@/table/useTable', () => ({
  useTable: (options) => {
    tableOptions.current = options;
    return { rows: [], pagination: {}, fetch: vi.fn() };
  },
}));

vi.mock('@/table/Table', () => ({ default: () => null }));

const SITES = ['tallinn', 'tartu', 'narva'];

const commonFlavor = (name: string, cores: number, ramGb: number) => ({
  name,
  cores,
  ram: ramGb * 1024,
  disk: 20480,
  sites: SITES.map((site) => ({
    offering_uuid: site,
    flavor_uuid: `${site}-${name}`,
  })),
});

const FLAVORS = [
  commonFlavor('small', 1, 2),
  commonFlavor('medium', 2, 4),
  commonFlavor('large', 8, 32),
];

const openPicker = async (nodeGroupType: 'worker' | 'storage') => {
  render(
    <K8sFlavorSelectionTable
      offeringUuid="tallinn"
      onFlavorSelect={vi.fn()}
      nodeGroupType={nodeGroupType}
      datacenterName="Datacenter 1"
      minimalSettings={{ minimal_worker_vcpus: 2, minimal_worker_ram_gb: 4 }}
      commonFlavors={{ key: 'k8s-cluster-3-datacenter', flavors: FLAVORS }}
      allSites
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /Select\.\.\./ }));
  const { openDialog } = vi.mocked(useModal)();
  const [Dialog, props] = vi.mocked(openDialog).mock.calls[0] as any;
  render(<Dialog {...props} />);
  const { rows } = await tableOptions.current.fetchData({
    currentPage: 1,
    pageSize: 10,
    filter: tableOptions.current.filter,
  });
  return rows;
};

describe('K8sFlavorSelectionTable with common flavors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableOptions.current = undefined;
  });

  it('lists the common flavors meeting the worker minimums', async () => {
    const rows = await openPicker('worker');

    expect(rows).toEqual([
      {
        uuid: 'tallinn-medium',
        name: 'medium',
        cores: 2,
        ram: 4096,
        disk: 20480,
      },
      {
        uuid: 'tallinn-large',
        name: 'large',
        cores: 8,
        ram: 32768,
        disk: 20480,
      },
    ]);
    expect(openstackFlavorsList).not.toHaveBeenCalled();
    // Cached per offering, option, topology and node group type.
    expect(tableOptions.current.table).toBe(
      'k8s-common-flavor-selection-k8s-cluster-3-datacenter-worker',
    );
    expect(
      screen.getByText('Select OpenStack flavor for worker nodes on all sites'),
    ).toBeInTheDocument();
  });

  it('lists every common flavor for storage nodes', async () => {
    const rows = await openPicker('storage');

    expect(rows.map((row) => row.name)).toEqual(['small', 'medium', 'large']);
  });
});
