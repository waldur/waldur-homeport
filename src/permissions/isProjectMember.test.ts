import { describe, expect, it } from 'vitest';
import { Permission, User } from 'waldur-js-client';

import { isProjectMember } from './isProjectMember';

const PROJECT_UUID = 'project-1';

const projectPermission = (scopeUuid: string): Permission =>
  ({ scope_type: 'project', scope_uuid: scopeUuid }) as Permission;

const makeUser = (overrides: Partial<User> = {}): User =>
  ({ is_staff: false, permissions: [], ...overrides }) as User;

describe('isProjectMember', () => {
  it('returns false when there is no user', () => {
    expect(isProjectMember(null as any, PROJECT_UUID)).toBe(false);
  });

  it('returns true for staff users by default', () => {
    expect(isProjectMember(makeUser({ is_staff: true }), PROJECT_UUID)).toBe(
      true,
    );
  });

  it('returns true for a user with a matching project permission', () => {
    const user = makeUser({ permissions: [projectPermission(PROJECT_UUID)] });
    expect(isProjectMember(user, PROJECT_UUID)).toBe(true);
  });

  it('returns false for a user with a permission on a different project', () => {
    const user = makeUser({ permissions: [projectPermission('other')] });
    expect(isProjectMember(user, PROJECT_UUID)).toBe(false);
  });

  describe('when includeStaff is false', () => {
    it('returns false for staff who are not connected to the project', () => {
      const user = makeUser({ is_staff: true, permissions: [] });
      expect(isProjectMember(user, PROJECT_UUID, { includeStaff: false })).toBe(
        false,
      );
    });

    it('returns true for staff who are directly connected to the project', () => {
      const user = makeUser({
        is_staff: true,
        permissions: [projectPermission(PROJECT_UUID)],
      });
      expect(isProjectMember(user, PROJECT_UUID, { includeStaff: false })).toBe(
        true,
      );
    });
  });
});
