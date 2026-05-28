import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OpenStackLoadBalancer } from 'waldur-js-client';

import { loadSecurityGroups } from '@/openstack/api';
import { renderWithProviders } from '@/test/harness';

import { SetSecurityGroupsDialog } from './SetSecurityGroupsDialog';

// Mock dependencies

vi.mock('@/openstack/api', () => ({
  loadSecurityGroups: vi.fn(),
}));

vi.mock('@/form/FormGroup', () => ({
  FormGroup: ({ label, children, input, meta, ...rest }: any) => (
    <div>
      <label>{label}</label>
      {React.cloneElement(children, { input, meta, ...rest })}
    </div>
  ),
}));

vi.mock('@/resource/actions/AsyncActionDialog', () => ({
  AsyncActionDialog: ({ title, children, footer, loading }: any) => (
    <div data-testid="async-action-dialog">
      <h1>{title}</h1>
      {loading ? <div>Loading...</div> : children}
      <div data-testid="footer">{footer}</div>
    </div>
  ),
}));

const mockResource = {
  uuid: 'lb-uuid',
  name: 'test-lb',
  tenant_uuid: 'tenant-uuid',
  vip_security_groups: [{ name: 'group-1', url: 'url-1' }],
} as OpenStackLoadBalancer;

describe('SetSecurityGroupsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadSecurityGroups).mockResolvedValue([
      { name: 'group-1', url: 'url-1' },
      { name: 'group-2', url: 'url-2' },
    ] as any);
  });

  it('renders correctly and loads options', async () => {
    renderWithProviders(
      <SetSecurityGroupsDialog
        resolve={{ resource: mockResource, refetch: vi.fn() }}
      />,
    );

    expect(
      screen.getByText('Set security groups for load balancer test-lb'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(loadSecurityGroups).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        field: ['name', 'url'],
      });
    });

    // We don't need to check SelectField internal behavior deeply if we trust it,
    // but we can check if it's rendered.
    await waitFor(() =>
      expect(screen.getByText('Security groups')).toBeInTheDocument(),
    );
  });
});
