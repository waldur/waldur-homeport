import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { RoleEnum } from '@/permissions/enums';

import {
  getOnlyOneProjectManagerTooltip,
  isOnlyOneProjectManagerEnabled,
  isProjectManagerRole,
  isProjectManagerSelectionBlocked,
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
