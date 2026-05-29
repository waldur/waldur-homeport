import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  OpenStackLoadBalancer,
  openstackSecurityGroupsList,
  openstackLoadbalancersSetSecurityGroups,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { SetSecurityGroupsDialog } from './SetSecurityGroupsDialog';

const mockResource = {
  uuid: 'lb-uuid',
  name: 'test-lb',
  tenant_uuid: 'tenant-uuid',
  vip_security_groups: [{ name: 'group-1', url: 'url-1' }],
} as OpenStackLoadBalancer;

describe('SetSecurityGroupsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly, loads options, and displays initial values', async () => {
    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: [
        { name: 'group-1', url: 'url-1' },
        { name: 'group-2', url: 'url-2' },
      ],
    } as any);

    renderWithProviders(
      <SetSecurityGroupsDialog
        resolve={{ resource: mockResource, refetch: vi.fn() }}
      />,
    );

    // Dialog title check
    expect(
      screen.getByText('Set security groups for load balancer test-lb'),
    ).toBeInTheDocument();

    // Verify correct API query was sent
    await waitFor(() => {
      expect(openstackSecurityGroupsList).toHaveBeenCalledWith({
        query: expect.objectContaining({
          tenant_uuid: 'tenant-uuid',
          field: ['name', 'url'],
        }),
      });
    });

    // The component should render the select field with label "Security groups"
    expect(await screen.findByText('Security groups')).toBeInTheDocument();

    // Initial value (group-1) should be visible as a selected tag
    expect(screen.getByText('group-1')).toBeInTheDocument();
  });

  it('submits updated security groups correctly', async () => {
    const user = userEvent.setup();
    const refetchMock = vi.fn();

    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: [
        { name: 'group-1', url: 'url-1' },
        { name: 'group-2', url: 'url-2' },
      ],
    } as any);

    vi.mocked(openstackLoadbalancersSetSecurityGroups).mockResolvedValue(
      {} as any,
    );

    renderWithProviders(
      <SetSecurityGroupsDialog
        resolve={{ resource: mockResource, refetch: refetchMock }}
      />,
    );

    // Wait for the field to load and render
    expect(await screen.findByText('Security groups')).toBeInTheDocument();

    // Add group-2 using the select test helper
    await openAndSelectOption(user, 'Security groups', 'group-2');

    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);

    // Verify form submission calls the correct endpoint with selected options
    await waitFor(() => {
      expect(openstackLoadbalancersSetSecurityGroups).toHaveBeenCalledWith({
        path: { uuid: 'lb-uuid' },
        body: {
          security_groups: ['url-1', 'url-2'],
        },
      });
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('handles API error during security groups load gracefully', async () => {
    vi.mocked(openstackSecurityGroupsList).mockRejectedValue(
      new Error('Failed to load'),
    );

    renderWithProviders(
      <SetSecurityGroupsDialog
        resolve={{ resource: mockResource, refetch: vi.fn() }}
      />,
    );

    // Verify error text is displayed
    expect(await screen.findByText('Unable to load data.')).toBeInTheDocument();
  });
});
