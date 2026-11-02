import { render, screen } from '@testing-library/react';
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
  it('shows the totals as one list of chips', () => {
    const { container } = render(
      <K8sTotalResourcesCard totalResources={totals} datacenterCount={2} />,
    );

    // The chips are rows of one description list, not eleven lists of one.
    // No Testing Library query counts description lists.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('dl')).toHaveLength(1);
    expect(screen.getAllByRole('term')).toHaveLength(11);
    expect(
      screen.getByRole('definition', { name: 'Total vCPUs:' }),
    ).toHaveTextContent('96 cores');
    expect(
      screen.getByRole('definition', { name: 'Datacenters:' }),
    ).toHaveTextContent('2');
  });
});
