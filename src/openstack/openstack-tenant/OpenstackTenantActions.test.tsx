import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { OpenstackTenantActions } from './OpenstackTenantActions';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: () => true,
}));

ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES = false;
ENV.plugins.WALDUR_OPENSTACK = { TENANT_CREDENTIALS_VISIBLE: true } as any;

const mockMarketplaceResource = {
  uuid: 'test-market-uuid',
  state: 'OK',
  customer_uuid: 'customer-uuid',
  name: 'Test Market Resource',
  provider_uuid: 'offering-uuid',
};
const mockResource = {
  uuid: 'test-scope-uuid',
  state: 'OK',
  marketplace_resource_uuid: 'test-market-uuid',
  customer_uuid: 'customer-uuid',
  provider_uuid: 'offering-uuid',
  name: 'Test Resource',
  quotas: [],
};

const renderComponent = (userOverrides = {}) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue({
    is_staff: true,
    permissions: [],
    ...userOverrides,
  } as any);
  return renderWithProviders(
    <OpenstackTenantActions
      marketplaceResource={mockMarketplaceResource}
      resource={mockResource}
      refetch={vi.fn()}
    />,
  );
};

describe('OpenstackTenantActions', () => {
  it('renders action groups with correct titles for staff user', () => {
    renderComponent();

    expect(
      screen.queryAllByRole('button').map((element) => element.textContent),
    ).toEqual([
      'Edit',
      'Replicate',
      'Synchronise',
      'Change limits',
      'Show usage',
      'Report usage',
      'Set backend ID',
      'Submit report',
      'Set termination date',
      'Set as erred',
      'Change quotas',
      'Move',
      'Unlink',
      'Mark as ERRED',
      'Mark as OK',
      'Terminate',
    ]);
  });

  it('hides Change quotas action for a non-privileged user', () => {
    // Non-staff user with no permissions on the provider organization
    renderComponent({ is_staff: false, permissions: [] });

    const buttonLabels = screen
      .queryAllByRole('button')
      .map((el) => el.textContent);
    expect(buttonLabels).not.toContain('Change quotas');
  });
});
