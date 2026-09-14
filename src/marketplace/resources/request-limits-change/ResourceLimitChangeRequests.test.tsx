import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ApproveAction } from './ResourceLimitChangeRequests';

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => true,
}));

const row = { uuid: 'request-uuid' } as any;
const resource = { project_uuid: 'project', customer_uuid: 'customer' } as any;

const renderApprove = (offering) =>
  renderWithProviders(
    inActionsMenu(
      <ApproveAction
        row={row}
        resource={resource}
        offering={offering}
        refetch={vi.fn()}
      />,
    ),
  );

describe('ApproveAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-uuid' } as any);
  });

  it('is offered while the offering accepts limit change requests', () => {
    renderApprove({
      plugin_options: { enable_resource_limit_change_requests: true },
    });

    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('is hidden once the offering stops accepting them, as approval is refused', () => {
    renderApprove({ plugin_options: {} });

    expect(screen.queryByText('Approve')).toBeNull();
  });

  it('is hidden when the offering is not known', () => {
    renderApprove(undefined);

    expect(screen.queryByText('Approve')).toBeNull();
  });
});
