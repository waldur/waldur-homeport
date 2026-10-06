import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CallTabs } from './CallTabs';

const call = {
  uuid: 'call-uuid',
  manager_uuid: 'managing-org-uuid',
  customer_uuid: 'customer-uuid',
  state: 'active',
} as any;

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
});

describe('CallTabs', () => {
  beforeEach(() => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'public-call.details' },
      params: {},
    } as any);
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.ROUND_CLOSER', permissions: [PermissionEnum.CLOSE_ROUNDS] },
      { name: 'CALL.MANAGER', permissions: [PermissionEnum.UPDATE_CALL] },
      { name: 'CALL.REVIEWER', permissions: [] },
    ] as any);
  });

  it('leads a round closer to the Edit page only', () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.ROUND_CLOSER')],
    } as any);
    renderWithProviders(<CallTabs call={call} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Manage')).not.toBeInTheDocument();
  });

  it('leads a call manager to both pages', () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.MANAGER')],
    } as any);
    renderWithProviders(<CallTabs call={call} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
  });

  it('shows a reviewer no tab strip', () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.REVIEWER')],
    } as any);
    renderWithProviders(<CallTabs call={call} />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});
