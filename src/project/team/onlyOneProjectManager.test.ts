import { describe, expect, it, vi } from 'vitest';
import { projectsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { RoleEnum } from '@/permissions/enums';

import {
  getOnlyOneProjectManagerTooltip,
  isOnlyOneProjectManagerEnabled,
  isProjectManagerRole,
  isProjectManagerSelectionBlocked,
  projectHasActiveManager,
} from './onlyOneProjectManager';

describe('onlyOneProjectManager', () => {
  it('reads ONLY_ONE_PROJECT_MANAGER from ENV', () => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = true;
    expect(isOnlyOneProjectManagerEnabled()).toBe(true);
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = false;
    expect(isOnlyOneProjectManagerEnabled()).toBe(false);
  });

  it('detects project manager role by name', () => {
    expect(isProjectManagerRole({ name: RoleEnum.PROJECT_MANAGER })).toBe(true);
    expect(isProjectManagerRole({ name: RoleEnum.PROJECT_MEMBER })).toBe(false);
    expect(
      isProjectManagerRole({
        name: 'PROJECT.acme.MANAGER',
        template_name: RoleEnum.PROJECT_MANAGER,
      }),
    ).toBe(true);
  });

  it('blocks new PM selection when project already has one', () => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = true;
    expect(
      isProjectManagerSelectionBlocked(true, {
        name: RoleEnum.PROJECT_MANAGER,
      }),
    ).toBe(true);
    expect(
      isProjectManagerSelectionBlocked(true, { name: RoleEnum.PROJECT_MEMBER }),
    ).toBe(false);
    expect(
      isProjectManagerSelectionBlocked(
        true,
        { name: RoleEnum.PROJECT_MANAGER },
        RoleEnum.PROJECT_MANAGER,
      ),
    ).toBe(false);
    expect(
      isProjectManagerSelectionBlocked(false, {
        name: RoleEnum.PROJECT_MANAGER,
      }),
    ).toBe(false);
  });

  it('lets a member who holds a project manager copy keep that role', () => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = true;
    ENV.roles = [
      {
        name: 'PROJECT.acme.MANAGER',
        template_name: RoleEnum.PROJECT_MANAGER,
        uuid: 'clone-uuid',
        content_type: 'project',
        is_active: true,
      } as any,
    ];
    expect(
      isProjectManagerSelectionBlocked(
        true,
        {
          name: 'PROJECT.acme.MANAGER',
          template_name: RoleEnum.PROJECT_MANAGER,
        },
        'PROJECT.acme.MANAGER',
      ),
    ).toBe(false);
  });

  it('looks up an organization copy when checking for an active manager', async () => {
    ENV.roles = [
      {
        name: 'PROJECT.acme.MANAGER',
        template_name: RoleEnum.PROJECT_MANAGER,
        uuid: 'clone-uuid',
        content_type: 'project',
        is_active: true,
      } as any,
    ];
    vi.mocked(projectsListUsersList).mockResolvedValue({ data: [{}] } as any);

    await expect(projectHasActiveManager('project-uuid')).resolves.toBe(true);
    expect(projectsListUsersList).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'project-uuid' },
        query: expect.objectContaining({
          role: expect.arrayContaining([
            RoleEnum.PROJECT_MANAGER,
            'PROJECT.acme.MANAGER',
            'clone-uuid',
          ]),
        }),
      }),
    );
  });

  it('uses deployment role label in tooltip', () => {
    ENV.roles = [
      {
        name: RoleEnum.PROJECT_MANAGER,
        description: 'PI',
        uuid: 'pm-uuid',
        content_type: 'project',
        is_active: true,
      } as any,
    ];
    expect(getOnlyOneProjectManagerTooltip()).toContain('PI');
  });
});
