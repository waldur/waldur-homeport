import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CreateSubnetAction } from './CreateSubnetAction';
import { DestroyNetworkAction } from './DestroyNetworkAction';
import { EditNetworkAction } from './EditNetworkAction';
import { PullNetworkAction } from './PullNetworkAction';
import { SetMtuAction } from './SetMtuAction';
import { ShareNetworkAction } from './ShareNetworkAction';

const OWNER_ACTIONS = [
  ShareNetworkAction,
  EditNetworkAction,
  PullNetworkAction,
  CreateSubnetAction,
  SetMtuAction,
  DestroyNetworkAction,
];

const network = (extra: Record<string, unknown>) => ({
  uuid: 'network-uuid',
  url: 'https://example.com/api/openstack-networks/network-uuid/',
  name: 'provider-lan',
  state: 'OK',
  backend_id: 'backend-id',
  tenant_name: 'Owner',
  tenant_is_managed: true,
  rbac_policies: [],
  ...extra,
});

const renderAction = (Action, resource) =>
  renderWithProviders(
    inActionsMenu(<Action resource={resource as any} refetch={vi.fn()} />),
  );

describe('Owner-side network actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it.each(OWNER_ACTIONS)(
    '%o is disabled with the reason on a network shared by the provider',
    (Action) => {
      renderAction(
        Action,
        network({
          tenant_name: 'admin',
          tenant_is_managed: false,
          // Staff manage every project, so the backend reports the share as
          // outbound to them; the unmanaged owner alone must disable it.
          rbac_policies: [{ direction: 'outbound' }],
        }),
      );

      expect(screen.getByTestId('action-item-content')).toHaveClass(
        'opacity-50',
      );
      expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
    },
  );

  it.each(OWNER_ACTIONS)(
    '%o is disabled on a network another tenant shares with the user',
    (Action) => {
      // A consumer with roles only on its own project, none on the owner's.
      vi.mocked(useUser).mockReturnValue({
        is_staff: false,
        permissions: [{ scope_uuid: 'consumer-project' }],
      } as any);
      renderAction(
        Action,
        network({ rbac_policies: [{ direction: 'inbound' }] }),
      );

      expect(screen.getByTestId('action-item-content')).toHaveClass(
        'opacity-50',
      );
    },
  );

  it.each(OWNER_ACTIONS)(
    '%o stays enabled for a member of the owning project',
    (Action) => {
      vi.mocked(useUser).mockReturnValue({
        is_staff: false,
        permissions: [{ scope_uuid: 'owner-project' }],
      } as any);
      renderAction(
        Action,
        network({
          project_uuid: 'owner-project',
          rbac_policies: [{ direction: 'inbound' }],
        }),
      );

      expect(screen.getByTestId('action-item-content')).not.toHaveClass(
        'opacity-50',
      );
    },
  );

  it.each(OWNER_ACTIONS)('%o stays enabled on an own network', (Action) => {
    renderAction(
      Action,
      network({ rbac_policies: [{ direction: 'outbound' }] }),
    );

    expect(screen.getByTestId('action-item-content')).not.toHaveClass(
      'opacity-50',
    );
  });
});
