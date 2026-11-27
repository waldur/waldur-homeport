import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ChangeEndDateAction } from './ChangeEndDateAction';

const project = {
  uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
} as any;
const originalRoles = ENV.roles;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  ENV.roles = originalRoles;
});

const renderAction = () =>
  renderWithProviders(
    inActionsMenu(<ChangeEndDateAction project={project} refetch={vi.fn()} />),
  );

describe('ChangeEndDateAction', () => {
  it('shows the action when PROJECT.REQUEST_END_DATE_CHANGE is held', () => {
    ENV.roles = [
      {
        name: 'PROJECT.MEMBER',
        permissions: [PermissionEnum.REQUEST_PROJECT_END_DATE_CHANGE],
      },
    ] as any;
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [
        {
          role_name: 'PROJECT.MEMBER',
          scope_type: 'project',
          scope_uuid: project.uuid,
        },
      ],
    } as any);

    renderAction();

    expect(screen.getByText('Change end date')).toBeInTheDocument();
  });

  it('hides the action for a project member without the request permission', () => {
    ENV.roles = [{ name: 'PROJECT.MEMBER', permissions: [] }] as any;
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [
        {
          role_name: 'PROJECT.MEMBER',
          scope_type: 'project',
          scope_uuid: project.uuid,
        },
      ],
    } as any);

    renderAction();

    expect(screen.queryByText('Change end date')).toBeNull();
  });
});
