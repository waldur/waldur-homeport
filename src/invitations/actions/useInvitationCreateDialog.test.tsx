import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  projectsListUsersList,
  userInvitationsCheckDuplicates,
} from 'waldur-js-client';

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

describe('useInvitationCreateDialog checkDuplicates', () => {
  const context = {
    roleTypes: ['project'],
    project,
    customer: { uuid: 'customer-uuid', url: '/customers/customer-uuid/' },
  } as any;

  const formData = {
    rows: [
      {
        email: 'member@example.com',
        role_project: { role: memberRole, project },
      },
    ],
  } as any;

  const renderCheck = () => {
    const { wrapper } = createTestWrapper();
    return renderHook(
      () => useInvitationCreateDialog(context).checkDuplicates,
      {
        wrapper,
      },
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = false;
    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
  });

  it('returns pending duplicates and existing roles side by side', async () => {
    vi.mocked(userInvitationsCheckDuplicates).mockResolvedValue({
      data: {
        duplicates: [{ email: 'member@example.com', role: 'member-uuid' }],
        existing_roles: [
          {
            email: 'member@example.com',
            role: 'member-uuid',
            existing_role: 'admin-uuid',
            existing_role_name: 'PROJECT.ADMIN',
            existing_role_description: 'Project administrator',
            is_same_role: false,
          },
        ],
      },
    } as any);

    const { result } = renderCheck();
    const outcome = await result.current(formData);

    // Both carry the project they were checked in, so a verdict can be
    // dropped from a row that moves to another project.
    expect(outcome.duplicatePairs).toEqual([
      {
        email: 'member@example.com',
        roleUuid: 'member-uuid',
        projectUuid: 'project-uuid',
      },
    ]);
    expect(outcome.existingRoleHits).toEqual([
      {
        email: 'member@example.com',
        roleUuid: 'member-uuid',
        projectUuid: 'project-uuid',
        existingRoleUuid: 'admin-uuid',
        existingRoleName: 'Project administrator',
        isSameRole: false,
      },
    ]);
  });

  it('returns both lists empty when no row is complete', async () => {
    const { result } = renderCheck();
    const outcome = await result.current({ rows: [{ email: '' }] } as any);

    expect(outcome).toEqual({ duplicatePairs: [], existingRoleHits: [] });
    expect(userInvitationsCheckDuplicates).not.toHaveBeenCalled();
  });
});
