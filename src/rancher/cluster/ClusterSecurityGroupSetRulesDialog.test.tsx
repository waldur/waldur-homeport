import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rancherClusterSecurityGroupsUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ClusterSecurityGroupSetRulesDialog } from './ClusterSecurityGroupSetRulesDialog';

const fakeResource = {
  uuid: 'cluster-uuid',
  name: 'test-cluster',
  rules: [
    {
      from_port: 80,
      to_port: 80,
      cidr: '0.0.0.0/0',
      protocol: 'tcp',
      ethertype: 'IPv4',
      direction: 'ingress',
    },
  ],
};

const renderDialog = (resource = fakeResource) => {
  return renderWithProviders(
    <ClusterSecurityGroupSetRulesDialog
      resolve={{ resource: resource as any, refetch: vi.fn() }}
    />,
  );
};

describe('ClusterSecurityGroupSetRulesDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with initial rules', async () => {
    renderDialog();
    expect(
      await screen.findByText(/Set rules in test-cluster security group/i),
    ).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('80').length).toBe(1);
    expect(screen.getByDisplayValue('0.0.0.0/0')).toBeInTheDocument();
  });

  it('submits updated rules', async () => {
    vi.mocked(rancherClusterSecurityGroupsUpdate).mockResolvedValue({} as any);
    renderDialog();
    await screen.findByText(/Set rules in test-cluster security group/i);

    const submitButton = screen.getByRole('button', {
      name: /^Set rules$/,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(rancherClusterSecurityGroupsUpdate).toHaveBeenCalled();
    });
  });
});
