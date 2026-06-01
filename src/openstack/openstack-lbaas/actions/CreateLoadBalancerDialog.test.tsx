import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackLoadbalancersCreate,
  openstackSubnetsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CreateLoadBalancerDialog } from './CreateLoadBalancerDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<CreateLoadBalancerDialog {...props} />);
};

describe('CreateLoadBalancerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const resource = {
    uuid: 'tenant-uuid',
    url: '/api/openstack-tenants/tenant-uuid/',
  };

  it('renders correctly and submits valid data', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([
        { uuid: 'subnet-1', name: 'Subnet 1', cidr: '10.0.0.0/24' },
      ]),
    );

    vi.mocked(openstackLoadbalancersCreate).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        resource,
        refetch,
      },
    });

    expect(
      await screen.findByText(/Create load balancer/i),
    ).toBeInTheDocument();

    expect(openstackSubnetsList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          tenant_uuid: 'tenant-uuid',
        }),
      }),
    );

    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'lb-1');

    // Select subnet (async select)
    await user.click(screen.getByLabelText(/VIP subnet/i));
    await user.click(await screen.findByText('Subnet 1 (10.0.0.0/24)'));

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(openstackLoadbalancersCreate).toHaveBeenCalledWith({
        body: {
          tenant: '/api/openstack-tenants/tenant-uuid/',
          name: 'lb-1',
          vip_subnet: expect.stringContaining(
            '/api/openstack-subnets/subnet-1/',
          ),
        },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});
