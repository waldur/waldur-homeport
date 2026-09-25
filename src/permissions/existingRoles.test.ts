import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  getExistingRoleFeedback,
  isExistingRoleBlocking,
  isMultipleRolesPerScopeDisabled,
  mapExistingRoleResponse,
  getWarningSignature,
  mapUserRoleDetails,
  shouldHoldForWarnings,
} from './existingRoles';

const ADMIN_UUID = 'role-admin';
const MANAGER_UUID = 'role-manager';

const permission = (roleUuid: string, roleName: string) =>
  ({
    role_uuid: roleUuid,
    role_name: roleName,
    user_email: 'member@example.com',
  }) as any;

describe('existingRoles', () => {
  it('reads INVITATION_DISABLE_MULTIPLE_ROLES from ENV', () => {
    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = true;
    expect(isMultipleRolesPerScopeDisabled()).toBe(true);
    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
    expect(isMultipleRolesPerScopeDisabled()).toBe(false);
  });

  it('prefers the deployment role description over the enum name', () => {
    const originalRoles = ENV.roles;
    ENV.roles = [
      { uuid: ADMIN_UUID, name: 'PROJECT.ADMIN', description: 'Administrator' },
    ] as any;

    const [hit] = mapUserRoleDetails(
      [permission(ADMIN_UUID, 'PROJECT.ADMIN')],
      MANAGER_UUID,
    );
    expect(hit.existingRoleName).toBe('Administrator');

    // Falls back to the raw name for a role the deployment does not list.
    const [unknown] = mapUserRoleDetails(
      [permission(MANAGER_UUID, 'PROJECT.MANAGER')],
      ADMIN_UUID,
    );
    expect(unknown.existingRoleName).toBe('PROJECT.MANAGER');

    ENV.roles = originalRoles;
  });

  it('marks the requested role as the same role it is already held under', () => {
    const hits = mapUserRoleDetails(
      [permission(ADMIN_UUID, 'Admin'), permission(MANAGER_UUID, 'Manager')],
      ADMIN_UUID,
    );
    expect(hits).toHaveLength(2);
    expect(hits[0]).toMatchObject({
      roleUuid: ADMIN_UUID,
      existingRoleUuid: ADMIN_UUID,
      existingRoleName: 'Admin',
      isSameRole: true,
    });
    expect(hits[1].isSameRole).toBe(false);
  });

  it('returns no feedback when the user holds no role in the scope', () => {
    expect(getExistingRoleFeedback([])).toBeNull();
  });

  it('blocks on the same role regardless of the flag', () => {
    const hits = mapUserRoleDetails(
      [permission(ADMIN_UUID, 'Admin')],
      ADMIN_UUID,
    );

    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
    expect(getExistingRoleFeedback(hits).blocking).toBe(true);

    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = true;
    expect(getExistingRoleFeedback(hits).blocking).toBe(true);
  });

  it('warns without blocking on a different role when multiple roles are allowed', () => {
    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
    const feedback = getExistingRoleFeedback(
      mapUserRoleDetails([permission(ADMIN_UUID, 'Admin')], MANAGER_UUID),
    );
    expect(feedback.blocking).toBe(false);
    expect(feedback.message).toContain('Admin');
  });

  it('blocks on a different role when multiple roles are disabled', () => {
    ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = true;
    const feedback = getExistingRoleFeedback(
      mapUserRoleDetails([permission(ADMIN_UUID, 'Admin')], MANAGER_UUID),
    );
    expect(feedback.blocking).toBe(true);
    expect(feedback.message).toContain('Admin');
  });

  describe('mapExistingRoleResponse', () => {
    const entry = (overrides: any = {}) =>
      ({
        email: 'member@example.com',
        role: MANAGER_UUID,
        existing_role: ADMIN_UUID,
        existing_role_name: 'PROJECT.ADMIN',
        existing_role_description: 'Project administrator',
        is_same_role: false,
        ...overrides,
      }) as any;

    it('prefers the description the backend already resolved', () => {
      const [hit] = mapExistingRoleResponse([entry()]);
      expect(hit).toMatchObject({
        email: 'member@example.com',
        roleUuid: MANAGER_UUID,
        existingRoleUuid: ADMIN_UUID,
        existingRoleName: 'Project administrator',
        isSameRole: false,
      });
    });

    it('falls back to the role name when the description is blank', () => {
      const [hit] = mapExistingRoleResponse([
        entry({ existing_role_description: '' }),
      ]);
      expect(hit.existingRoleName).toBe('PROJECT.ADMIN');
    });

    it('takes is_same_role from the backend rather than recomputing it', () => {
      const [hit] = mapExistingRoleResponse([
        entry({ is_same_role: true, existing_role: ADMIN_UUID }),
      ]);
      expect(hit.isSameRole).toBe(true);
    });

    it('classifies each hit the way the dialog splits them', () => {
      const sameRole = mapExistingRoleResponse([
        entry({ is_same_role: true }),
      ])[0];
      const differentRole = mapExistingRoleResponse([entry()])[0];

      ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
      expect(isExistingRoleBlocking(sameRole)).toBe(true);
      expect(isExistingRoleBlocking(differentRole)).toBe(false);

      ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = true;
      expect(isExistingRoleBlocking(differentRole)).toBe(true);
    });
  });

  describe('shouldHoldForWarnings', () => {
    const hit = (email: string) =>
      ({
        email,
        roleUuid: MANAGER_UUID,
        existingRoleUuid: ADMIN_UUID,
        existingRoleName: 'Admin',
        isSameRole: false,
      }) as any;

    it('does not hold when there is nothing to warn about', () => {
      expect(shouldHoldForWarnings([], '')).toBe(false);
    });

    it('holds the first time a warning appears', () => {
      expect(shouldHoldForWarnings([hit('a@example.com')], '')).toBe(true);
    });

    it('lets the second attempt through once the same warnings were shown', () => {
      const hits = [hit('a@example.com')];
      const signature = getWarningSignature(hits);
      expect(shouldHoldForWarnings(hits, signature)).toBe(false);
    });

    it('treats the same warnings in another order as already shown', () => {
      // Scopes are checked in parallel, so answers arrive in any order.
      const shown = getWarningSignature([
        hit('a@example.com'),
        hit('b@example.com'),
      ]);
      expect(
        shouldHoldForWarnings(
          [hit('b@example.com'), hit('a@example.com')],
          shown,
        ),
      ).toBe(false);
    });

    it('holds again when a different set of warnings turns up', () => {
      const shown = getWarningSignature([hit('a@example.com')]);
      expect(shouldHoldForWarnings([hit('b@example.com')], shown)).toBe(true);
    });
  });
});
