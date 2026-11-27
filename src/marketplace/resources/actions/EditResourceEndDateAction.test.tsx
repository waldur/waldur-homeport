import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { EditResourceEndDateAction } from './EditResourceEndDateAction';

const resource = {
  uuid: 'resource-uuid',
  state: 'OK',
  customer_uuid: 'customer-uuid',
  project_uuid: 'project-uuid',
} as any;

const SET = PermissionEnum.SET_RESOURCE_END_DATE;

const withRole = (grant: Record<string, string>) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    { name: 'ROLE', permissions: [SET] },
  ] as any);
  vi.mocked(useUser).mockReturnValue({
    is_staff: false,
    permissions: [{ role_name: 'ROLE', ...grant }],
  } as any);
};

const renderAction = () =>
  renderWithProviders(
    inActionsMenu(
      <EditResourceEndDateAction resource={resource} refetch={vi.fn()} />,
    ),
  );

describe('EditResourceEndDateAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
      data: { components: [] },
    } as any);
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the action for RESOURCE.SET_END_DATE on the organization', async () => {
    withRole({ scope_type: 'customer', scope_uuid: 'customer-uuid' });

    renderAction();

    expect(await screen.findByText('Set termination date')).toBeInTheDocument();
  });

  it('shows the action for RESOURCE.SET_END_DATE on the project', async () => {
    // The backend accepts the permission on the project as well; such a user
    // is refused a request, so hiding this would leave them no way at all.
    withRole({ scope_type: 'project', scope_uuid: 'project-uuid' });

    renderAction();

    expect(await screen.findByText('Set termination date')).toBeInTheDocument();
  });

  it('hides the action for a role on the organization’s service provider', () => {
    // That role acts for the provider; the consumer-side endpoint refuses it.
    withRole({
      scope_type: 'service_provider',
      scope_uuid: 'provider-uuid',
      customer_uuid: 'customer-uuid',
    });

    renderAction();

    expect(screen.queryByText('Set termination date')).toBeNull();
  });
});
