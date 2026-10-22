import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OfferingComponent, Resource } from 'waldur-js-client';

import { ResourceUsageLimits } from './ProjectResourcesExpandableRow';

const component = (overrides: Partial<OfferingComponent>) =>
  ({
    type: 'cpu',
    name: 'CPU',
    measured_unit: '',
    factor: 1,
    billing_type: 'limit',
    ...overrides,
  }) as OfferingComponent;

const renderCell = (
  components: OfferingComponent[],
  resource: Partial<Resource>,
) =>
  render(
    <ResourceUsageLimits
      row={{ offering_uuid: 'offering-1', ...resource } as Resource}
      offerings={[{ uuid: 'offering-1', components }]}
      isLoading={false}
    />,
  );

describe('ResourceUsageLimits', () => {
  it('shows usage against the limit inline, coloured by how close it is', () => {
    renderCell([component({}), component({ type: 'ram', name: 'RAM' })], {
      limits: { cpu: 10, ram: 10 },
      limit_usage: { cpu: 4, ram: 9 },
    });

    expect(screen.getByText('4 / 10')).toHaveClass('text-warning');
    expect(screen.getByText('9 / 10')).toHaveClass('text-danger');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows usage alone when a usage component has no limit', () => {
    renderCell(
      [component({ type: 'gpu', name: 'GPU', billing_type: 'usage' })],
      {
        current_usages: { gpu: 7 },
      },
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows a dash when the offering has no measured components', () => {
    const { container } = renderCell(
      [component({ billing_type: 'fixed' })],
      {},
    );

    expect(container).toHaveTextContent('—');
    expect(screen.queryByText('CPU')).not.toBeInTheDocument();
  });

  it('shows usage alone, not NaN%, when the resource stores no limit', () => {
    const { container } = renderCell([component({})], {
      limit_usage: { cpu: 0 },
    });

    expect(container).not.toHaveTextContent('NaN');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the two components closest to their limits, the rest on click', async () => {
    const types = ['cpu', 'ram', 'disk', 'gpu', 'net'];
    renderCell(
      types.map((type) => component({ type, name: type.toUpperCase() })),
      {
        limits: { cpu: 10, ram: 10, disk: 10, gpu: 10, net: 10 },
        limit_usage: { cpu: 1, ram: 9, disk: 5, gpu: 15, net: 2 },
      },
    );

    expect(screen.getByText('GPU')).toBeInTheDocument();
    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.queryByText('DISK')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '+3 more' }));

    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
    expect(screen.getByText('DISK')).toBeInTheDocument();
    expect(screen.getByText('(150%)')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'GPU' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
