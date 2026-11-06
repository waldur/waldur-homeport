import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { K8sTotalResourcesCard } from './K8sTotalResourcesCard';

const totals = {
  totalNodes: 12,
  totalWorkerNodes: 6,
  totalStorageNodes: 2,
  totalControllerNodes: 3,
  totalLoadBalancerNodes: 1,
  totalVCpus: 96,
  totalRam: 384,
  totalSystemStorage: 500,
  totalDataStorage: 2000,
  totalSanStorage: 1000,
};

describe('K8sTotalResourcesCard', () => {
  it('leads with the sizing figures and puts the datacenters in the header', () => {
    render(
      <K8sTotalResourcesCard totalResources={totals} datacenterCount={2} />,
    );

    expect(screen.getByText('Datacenters: 2')).toBeInTheDocument();
    // Label, then figure, tile by tile.
    expect(document.body).toHaveTextContent(
      /Nodes\s*12\s*vCPUs\s*96 cores\s*Memory\s*384 GB/,
    );
  });

  it('breaks the nodes down by role and totals the disks', () => {
    render(
      <K8sTotalResourcesCard totalResources={totals} datacenterCount={2} />,
    );

    const roles = within(screen.getByRole('region', { name: 'Node roles' }));
    expect(roles.getAllByRole('term').map((t) => t.textContent)).toEqual([
      'Controllers',
      'Load balancers',
      'Workers',
      'Storage nodes',
    ]);
    expect(roles.getAllByRole('definition').map((d) => d.textContent)).toEqual([
      '3',
      '1',
      '6',
      '2',
    ]);

    const disks = within(screen.getByRole('region', { name: 'Disks' }));
    expect(disks.getAllByRole('definition').map((d) => d.textContent)).toEqual([
      '500 GB',
      '2,000 GB',
      '1,000 GB',
      '3,500 GB',
    ]);
  });
});
