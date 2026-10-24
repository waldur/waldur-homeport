import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { TerminateAction } from './TerminateAction';

// Capture the config handed to useManagedMutation (the hook itself is covered
// by its own test) so the confirmation the action asks for can be rendered.
const { captured } = vi.hoisted(() => ({ captured: { value: null as any } }));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate: vi.fn() };
  },
}));

const renderConfirmation = (resource_type: string) => {
  renderWithProviders(
    inActionsMenu(
      <TerminateAction
        resource={{
          uuid: 'resource-uuid',
          marketplace_resource_uuid: 'marketplace-uuid',
          name: 'resource-1',
          state: 'OK',
          resource_type,
          project_uuid: 'project-uuid',
          project_name: 'Project',
          customer_uuid: 'customer-uuid',
          customer_name: 'Organization',
        }}
      />,
    ),
  );
  return render(captured.value.confirmation.body);
};

describe('TerminateAction confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('warns that terminating a tenant deletes everything in it', () => {
    renderConfirmation('OpenStack.Tenant');

    expect(
      screen.getByText(
        'Deleting an OpenStack tenant also deletes all resources created within it.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please make sure you have backed up your data.'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual([
      'Virtual machines',
      'Volumes and snapshots',
      'Internal networks',
      'External networks (if they belong to the tenant)',
      'Security groups',
    ]);
  });

  it('warns that terminating a cluster deletes its nodes’ infrastructure', () => {
    renderConfirmation('Rancher.Cluster');

    expect(
      screen.getByText(
        'Deleting a cluster also deletes the infrastructure its Kubernetes nodes run on:',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['VMs', 'Volumes']);
    expect(
      screen.getByText(
        'Unlink the VMs from their Kubernetes nodes first if you want to keep them.',
      ),
    ).toBeInTheDocument();
  });

  it('adds no warning for other resources', () => {
    renderConfirmation('OpenStackTenant.Instance');

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you would like to terminate resource/),
    ).toBeInTheDocument();
  });
});
