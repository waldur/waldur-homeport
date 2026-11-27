import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DatacenterNodeGroup } from './k8s-types';
import { K8sNodeGroupCard } from './K8sNodeGroupCard';

const storageGroup = (vcpus: number, ramGb: number): DatacenterNodeGroup => ({
  id: 'dc1-storage-1',
  type: 'storage',
  node_count: 3,
  openstack_flavor: {
    uuid: 'flavor',
    name: 'flavor',
    vcpus,
    ram: ramGb * 1024,
    disk: 20480,
  },
  disk_config: {
    system_disk_size_gb: 20,
    data_disk_size_gb: 100,
    virtual_san_disk_size_gb: 500,
  },
});

const switchToWorker = async (nodeGroup: DatacenterNodeGroup) => {
  const onUpdate = vi.fn();
  render(
    <K8sNodeGroupCard
      nodeGroup={nodeGroup}
      index={0}
      datacenterName="Datacenter 1"
      offeringUuid="tallinn"
      onUpdate={onUpdate}
      onRemove={vi.fn()}
      canRemove={false}
      defaultConfigs={{ minimal_worker_vcpus: 2, minimal_worker_ram_gb: 4 }}
    />,
  );
  await userEvent.click(
    screen.getByText('Storage - Distributed storage and persistence'),
  );
  await userEvent.click(screen.getByText('Worker - Application workloads'));
  return onUpdate.mock.calls[0][0];
};

describe('K8sNodeGroupCard profile switch', () => {
  it('drops a flavor too small for worker nodes', async () => {
    const updates = await switchToWorker(storageGroup(1, 2));

    expect(updates.type).toBe('worker');
    expect(updates).toHaveProperty('openstack_flavor', undefined);
  });

  it('keeps a flavor that meets the worker minimums', async () => {
    const updates = await switchToWorker(storageGroup(4, 8));

    expect(updates.type).toBe('worker');
    expect(updates).not.toHaveProperty('openstack_flavor');
  });
});
