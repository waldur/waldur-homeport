import { describe, expect, it } from 'vitest';
import { Permission, User } from 'waldur-js-client';

import { isReadOnlyProjectReader } from './isReadOnlyProjectReader';

const PROJECT = { uuid: 'project-1', customer_uuid: 'customer-1' };

const permission = (
  scope_type: string,
  scope_uuid: string,
  role_name = '',
): Permission => ({ scope_type, scope_uuid, role_name }) as Permission;

const callManager = () => permission('call', 'call-1', 'CALL.MANAGER');

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as User;

describe('isReadOnlyProjectReader', () => {
  it('is false without a user or a project', () => {
    expect(isReadOnlyProjectReader(null, PROJECT)).toBe(false);
    expect(isReadOnlyProjectReader(makeUser(), null)).toBe(false);
  });

  it('is true for a call manager with no role on the project', () => {
    const user = makeUser({ permissions: [callManager()] });
    expect(isReadOnlyProjectReader(user, PROJECT)).toBe(true);
  });

  it.each(['CALL.REVIEWER', 'CALL.PANEL_MEMBER'])(
    'is false for a %s, who reads no allocated project',
    (role_name) => {
      const user = makeUser({
        permissions: [permission('call', 'call-1', role_name)],
      });
      expect(isReadOnlyProjectReader(user, PROJECT)).toBe(false);
    },
  );

  it('is false when the call manager is also a project member', () => {
    const user = makeUser({
      permissions: [callManager(), permission('project', PROJECT.uuid)],
    });
    expect(isReadOnlyProjectReader(user, PROJECT)).toBe(false);
  });

  it('is false when the call manager has a role on the organisation', () => {
    const user = makeUser({
      permissions: [
        callManager(),
        permission('customer', PROJECT.customer_uuid),
      ],
    });
    expect(isReadOnlyProjectReader(user, PROJECT)).toBe(false);
  });

  it('is false for staff', () => {
    const user = makeUser({
      is_staff: true,
      permissions: [callManager()],
    });
    expect(isReadOnlyProjectReader(user, PROJECT)).toBe(false);
  });

  it('is false for a user with no call role', () => {
    expect(isReadOnlyProjectReader(makeUser(), PROJECT)).toBe(false);
  });
});
