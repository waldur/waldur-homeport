import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ConnectSubnetAction } from './ConnectSubnetAction';
import { DestroySubnetAction } from './DestroySubnetAction';
import { DisconnectSubnetAction } from './DisconnectSubnetAction';
import { EditSubnetAction } from './EditSubnetAction';
import { PullSubnetAction } from './PullSubnetAction';

const OWNER_ACTIONS = [
  EditSubnetAction,
  ConnectSubnetAction,
  DisconnectSubnetAction,
  PullSubnetAction,
  DestroySubnetAction,
];

const subnet = (extra: Record<string, unknown>) => ({
  uuid: 'subnet-uuid',
  url: 'https://example.com/api/openstack-subnets/subnet-uuid/',
  name: 'provider-lan-subnet',
  state: 'OK',
  backend_id: 'backend-id',
  tenant_name: 'Owner',
  tenant_is_managed: true,
  project_uuid: 'owner-project',
  customer_uuid: 'owner-org',
  ...extra,
});

const renderAction = (Action, resource) =>
  renderWithProviders(
    inActionsMenu(<Action resource={resource as any} refetch={vi.fn()} />),
  );

const isDisabled = () =>
  screen.getByTestId('action-item-content').classList.contains('opacity-50');

describe('Owner-side subnet actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(OWNER_ACTIONS)(
    '%o is disabled for staff on a subnet the provider shares',
    (Action) => {
      vi.mocked(useUser).mockReturnValue({
        is_staff: true,
        permissions: [],
      } as any);
      renderAction(Action, subnet({ tenant_is_managed: false }));

      expect(isDisabled()).toBe(true);
      expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
    },
  );

  it.each(OWNER_ACTIONS)(
    '%o is disabled for a consumer without a role on the owner',
    (Action) => {
      vi.mocked(useUser).mockReturnValue({
        is_staff: false,
        permissions: [{ scope_uuid: 'consumer-project' }],
      } as any);
      renderAction(Action, subnet({}));

      expect(isDisabled()).toBe(true);
    },
  );

  it.each(OWNER_ACTIONS)(
    '%o stays enabled for a user with a role on the owning project',
    (Action) => {
      vi.mocked(useUser).mockReturnValue({
        is_staff: false,
        permissions: [{ scope_uuid: 'owner-project' }],
      } as any);
      renderAction(Action, subnet({}));

      expect(isDisabled()).toBe(false);
    },
  );
});
