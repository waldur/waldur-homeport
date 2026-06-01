import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackLoadbalancersRetrieve,
  openstackPoolMembersCreate,
  openstackSubnetsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CreateMemberDialog } from './CreateMemberDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<CreateMemberDialog {...props} />);
};

describe('CreateMemberDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const resource = {
    uuid: 'pool-uuid',
    url: '/api/openstack-pools/pool-uuid/',
    load_balancer_uuid: 'lb-uuid',
  };

  it('renders correctly and submits valid data', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    vi.mocked(openstackLoadbalancersRetrieve).mockResolvedValue({
      data: { tenant_uuid: 'tenant-uuid' },
    } as any);

    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([
        { uuid: 'subnet-1', name: 'Subnet 1', cidr: '10.0.0.0/24' },
      ]),
    );

    vi.mocked(openstackPoolMembersCreate).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        resource,
        refetch,
      },
    });

    expect(await screen.findByText(/Add member/i)).toBeInTheDocument();

    // Verify lb retrieval
    expect(openstackLoadbalancersRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'lb-uuid' },
      query: { field: ['tenant_uuid'] },
    });

    // Subnet API uses tenant_uuid to fetch
    expect(openstackSubnetsList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          tenant_uuid: 'tenant-uuid',
        }),
      }),
    );

    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'member-1');
    await user.type(screen.getByLabelText(/IP address/i), '10.0.0.10');

    // Clear the number inputs before typing to avoid appending to defaults
    const portInput = screen.getByLabelText(/Port/i);
    await user.clear(portInput);
    await user.type(portInput, '8080');

    const weightInput = screen.getByLabelText(/Weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '10');

    // Select subnet (async select)
    await user.click(screen.getByLabelText(/Subnet/i));
    await user.click(await screen.findByText('Subnet 1 (10.0.0.0/24)'));

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(openstackPoolMembersCreate).toHaveBeenCalledWith({
        body: {
          pool: '/api/openstack-pools/pool-uuid/',
          name: 'member-1',
          address: '10.0.0.10',
          protocol_port: 8080,
          weight: 10,
          subnet: expect.stringContaining('/api/openstack-subnets/subnet-1/'),
        },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});
