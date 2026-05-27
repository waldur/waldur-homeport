import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackSecurityGroupsList,
  openstackTenantsCreateSecurityGroup,
} from 'waldur-js-client';

import { CreateSecurityGroupDialog } from './CreateSecurityGroupDialog';

vi.mock('waldur-js-client');

const fakeTenant = {
  name: 'VPC',
  url: '/api/openstack-tenants/2bfc029827bb41e884ff60f4b8eff3b2/',
  uuid: '2bfc029827bb41e884ff60f4b8eff3b2',
};

const defaultSecurityGroup = {
  url: '/api/openstack-security-groups/c4d9e3ece3be48ddb6dcf86c81b695de/',
  uuid: 'c4d9e3ece3be48ddb6dcf86c81b695de',
  name: 'default',
};

const renderDialog = (resource = fakeTenant) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSecurityGroupDialog
        resolve={{ resource: resource as any, refetch: vi.fn() }}
      />
    </QueryClientProvider>,
  );
};

describe('CreateSecurityGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: [defaultSecurityGroup],
      headers: { 'x-result-count': '1' },
    } as any);
  });

  it('sends REST API request when form is being submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsCreateSecurityGroup).mockResolvedValue({} as any);
    renderDialog();

    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Name'), 'TCP');
    await user.type(
      screen.getByLabelText('Description'),
      'Security group for incoming TCP requests',
    );

    await user.click(screen.getByText('Add rule'));

    const portInput = await screen.findByPlaceholderText('All ports');
    await user.type(portInput, '443');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackTenantsCreateSecurityGroup).toHaveBeenCalledWith({
        path: { uuid: fakeTenant.uuid },
        body: expect.objectContaining({
          name: 'TCP',
          description: 'Security group for incoming TCP requests',
          rules: expect.arrayContaining([
            expect.objectContaining({
              direction: 'ingress',
              ethertype: 'IPv4',
              protocol: 'tcp',
              from_port: 443,
              to_port: 443,
            }),
          ]),
        }),
      });
    });
  });

  it('allows to create empty group', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsCreateSecurityGroup).mockResolvedValue({} as any);
    renderDialog();

    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Name'), 'Empty');
    await user.type(
      screen.getByLabelText('Description'),
      'Empty Security Group',
    );

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackTenantsCreateSecurityGroup).toHaveBeenCalledWith({
        path: { uuid: fakeTenant.uuid },
        body: {
          name: 'Empty',
          description: 'Empty Security Group',
          rules: [],
        },
      });
    });
  });
});
