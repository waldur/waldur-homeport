import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OpenStackInstance,
  openstackInstancesUpdateSecurityGroups,
} from 'waldur-js-client';

import { loadSecurityGroups } from '@/openstack/api';

import { UpdateSecurityGroupsDialog } from './UpdateSecurityGroupsDialog';

vi.mock('@/openstack/api', () => ({
  loadSecurityGroups: vi.fn(),
}));

vi.mock('waldur-js-client');

const mockResource = {
  uuid: 'instance-uuid',
  name: 'test-instance',
  resource_type: 'OpenStack.Instance',
  tenant_uuid: 'tenant-uuid',
  service_settings_uuid: 'ss-uuid',
  security_groups: [
    { name: 'default', url: 'http://api/sg/sg-1/' },
    { name: 'web', url: 'http://api/sg/sg-2/' },
  ],
} as unknown as OpenStackInstance;

const securityGroupsResponse = [
  { name: 'default', url: 'http://api/sg/sg-1/' },
  { name: 'web', url: 'http://api/sg/sg-2/' },
  { name: 'db', url: 'http://api/sg/sg-3/' },
];

const renderDialog = (resource = mockResource) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UpdateSecurityGroupsDialog resolve={{ resource, refetch: vi.fn() }} />
    </QueryClientProvider>,
  );
};

describe('UpdateSecurityGroupsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadSecurityGroups).mockResolvedValue(
      securityGroupsResponse as any,
    );
  });

  it('renders title with resource name', () => {
    renderDialog();

    expect(
      screen.getByText(
        'Update security groups for OpenStack instance test-instance',
      ),
    ).toBeInTheDocument();
  });

  it('shows loading state while fetching security groups', () => {
    // Never resolve to keep loading
    vi.mocked(loadSecurityGroups).mockReturnValue(new Promise(() => {}));
    renderDialog();

    // AsyncActionDialog renders LoadingSpinner which has role="status"
    expect(screen.getByRole('status')).toBeInTheDocument();
    // Security groups content should not be visible while loading
    expect(screen.queryByText('Security groups')).not.toBeInTheDocument();
  });

  it('loads security groups from the API', async () => {
    renderDialog();

    await waitFor(() => {
      expect(loadSecurityGroups).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        field: ['name', 'url'],
      });
    });
  });

  it('renders the security groups label after loading', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Security groups')).toBeInTheDocument();
    });
  });

  it('pre-selects the initial security groups', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Security groups')).toBeInTheDocument();
    });

    // Initial values from resource.security_groups
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('web')).toBeInTheDocument();
  });

  it('shows error state when loading fails', async () => {
    vi.mocked(loadSecurityGroups).mockRejectedValue(new Error('Network error'));
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Unable to load data.')).toBeInTheDocument();
    });
  });

  it('submits the selected security groups', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackInstancesUpdateSecurityGroups).mockResolvedValue(
      {} as any,
    );

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Security groups')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdateSecurityGroups).toHaveBeenCalledWith({
        path: { uuid: 'instance-uuid' },
        body: {
          security_groups: ['http://api/sg/sg-1/', 'http://api/sg/sg-2/'],
        },
      });
    });
  });
});
