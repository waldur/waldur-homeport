import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OrderDetailsHeaderBody } from './OrderDetailsHeaderBody';

const order = {
  uuid: 'order-uuid',
  customer_uuid: 'consumer-uuid',
  customer_name: 'Consumer',
  project_uuid: 'project-uuid',
  project_name: 'Project',
  provider_uuid: 'provider-uuid',
  marketplace_resource_uuid: 'resource-uuid',
  resource_name: 'My resource',
  offering_uuid: 'offering-uuid',
  offering_name: 'Offering',
  limits: {},
};

const resourceHref = () =>
  screen.getByRole('link', { name: 'My resource' }).getAttribute('href');

const renderFor = (user) => {
  vi.mocked(useUser).mockReturnValue(user);
  renderWithProviders(<OrderDetailsHeaderBody order={order} />);
};

describe('OrderDetailsHeaderBody resource link', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'LISTER', permissions: [PermissionEnum.LIST_RESOURCES] },
      { name: 'CUSTOMER.OWNER', permissions: [PermissionEnum.LIST_RESOURCES] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the provider view for an owner of the provider only', () => {
    renderFor({
      is_staff: false,
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'provider-uuid',
          role_name: 'CUSTOMER.OWNER',
        },
      ],
    });

    expect(resourceHref()).toContain('marketplace-provider-resource-details');
    expect(resourceHref()).toContain('provider-uuid');
  });

  it('opens the consumer view for a user who can list the consumer resources', () => {
    renderFor({
      is_staff: false,
      permissions: [
        {
          scope_type: 'project',
          scope_uuid: 'project-uuid',
          role_name: 'LISTER',
        },
        {
          scope_type: 'customer',
          scope_uuid: 'provider-uuid',
          role_name: 'CUSTOMER.OWNER',
        },
      ],
    });

    expect(resourceHref()).toMatch(/^marketplace-resource-details/);
  });

  it('opens the consumer view for staff', () => {
    renderFor({ is_staff: true, permissions: [] });

    expect(resourceHref()).toMatch(/^marketplace-resource-details/);
  });
});
