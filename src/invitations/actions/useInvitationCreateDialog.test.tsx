import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { RoleEnum } from '@/permissions/enums';
import { createTestWrapper } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { useInvitationCreateDialog } from './useInvitationCreateDialog';

const managerRole = {
  uuid: 'pm-uuid',
  name: RoleEnum.PROJECT_MANAGER,
  description: 'Project manager',
  content_type: 'project',
  is_active: true,
} as any;

const memberRole = {
  uuid: 'member-uuid',
  name: RoleEnum.PROJECT_MEMBER,
  description: 'Project member',
  content_type: 'project',
  is_active: true,
} as any;

const project = { uuid: 'project-uuid', url: '/projects/project-uuid/' };

const renderRoles = (context: any) => {
  const { wrapper } = createTestWrapper();
  return renderHook(() => useInvitationCreateDialog(context).roles, {
    wrapper,
  });
};

describe('useInvitationCreateDialog roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = true;
  });

  it('disables the project manager option when the project already has one', async () => {
    vi.mocked(projectsListUsersList).mockResolvedValue(
      mockListResponse([{ role_name: RoleEnum.PROJECT_MANAGER }]) as any,
    );
    const { result } = renderRoles({
      project,
      roleTypes: ['project'],
      rolesOverride: [managerRole, memberRole],
    });

    await waitFor(() =>
      expect(result.current.find((r) => r.uuid === 'pm-uuid')).toMatchObject({
        is_active: false,
        tooltip: expect.stringContaining('Only one'),
      }),
    );
    expect(result.current.find((r) => r.uuid === 'member-uuid')).toMatchObject({
      is_active: true,
    });
  });

  it('keeps the project manager option enabled when the project has none', async () => {
    vi.mocked(projectsListUsersList).mockResolvedValue(
      mockListResponse([]) as any,
    );
    const { result } = renderRoles({
      project,
      roleTypes: ['project'],
      rolesOverride: [managerRole, memberRole],
    });

    await waitFor(() =>
      expect(vi.mocked(projectsListUsersList)).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(result.current.find((r) => r.uuid === 'pm-uuid')).toMatchObject({
        is_active: true,
      }),
    );
  });

  it('does not query or disable at organization scope', () => {
    const { result } = renderRoles({
      customer: {
        uuid: 'customer-uuid',
        projects: [project],
        projects_count: 1,
      },
      roleTypes: ['project'],
      rolesOverride: [managerRole, memberRole],
    });

    expect(vi.mocked(projectsListUsersList)).not.toHaveBeenCalled();
    expect(result.current.find((r) => r.uuid === 'pm-uuid')).toMatchObject({
      is_active: true,
    });
  });

  it('does nothing when the setting is off', () => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = false;
    const { result } = renderRoles({
      project,
      roleTypes: ['project'],
      rolesOverride: [managerRole, memberRole],
    });

    expect(vi.mocked(projectsListUsersList)).not.toHaveBeenCalled();
    expect(result.current.find((r) => r.uuid === 'pm-uuid')).toMatchObject({
      is_active: true,
    });
  });
});
