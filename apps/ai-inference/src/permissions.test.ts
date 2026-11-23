import { describe, expect, it } from 'vitest';

import {
  approverRolesText,
  canManageKeys,
  canRotate,
  Grants,
  MANAGE_KEYS,
  REVEAL_SHARED_KEYS,
  revealBlockedReason,
} from './permissions';

const project = { uuid: 'p1', customer_uuid: 'c1' };

const grants = (role: string, scope = 'project', isStaff = false): Grants => ({
  userUuid: 'me',
  isStaff,
  permissions: [
    {
      scope_type: scope,
      scope_uuid: scope === 'project' ? 'p1' : 'c1',
      role_name: role,
      expiration_time: null,
    },
  ],
  roles: new Map([
    ['PROJECT.MANAGER', new Set([MANAGE_KEYS, REVEAL_SHARED_KEYS])],
    ['PROJECT.MEMBER', new Set<string>()],
    ['CUSTOMER.OWNER', new Set([MANAGE_KEYS])],
  ]),
});

describe('key permissions', () => {
  it("lets managers and owners issue keys, from the roles' permissions", () => {
    expect(canManageKeys(grants('PROJECT.MANAGER'), project)).toBe(true);
    expect(canManageKeys(grants('CUSTOMER.OWNER', 'customer'), project)).toBe(
      true,
    );
    expect(canManageKeys(grants('PROJECT.MEMBER'), project)).toBe(false);
    expect(
      canManageKeys(grants('PROJECT.MEMBER', 'project', true), project),
    ).toBe(true);
  });

  it('reveals an assigned key to its assignee alone', () => {
    const mine = { state: 'OK' as const, user_uuid: 'me' };
    const theirs = { state: 'OK' as const, user_uuid: 'someone' };
    expect(
      revealBlockedReason(mine, grants('PROJECT.MEMBER'), project),
    ).toBeUndefined();
    expect(
      revealBlockedReason(theirs, grants('PROJECT.MANAGER'), project),
    ).toBeDefined();
  });

  it('reveals a shared key to roles that carry the permission', () => {
    const shared = { state: 'OK' as const, user_uuid: null };
    expect(
      revealBlockedReason(shared, grants('PROJECT.MANAGER'), project),
    ).toBeUndefined();
    expect(
      revealBlockedReason(shared, grants('PROJECT.MEMBER'), project),
    ).toBeDefined();
  });

  it('reveals nothing that is not active, nor to staff outside the project', () => {
    expect(
      revealBlockedReason(
        { state: 'Creating', user_uuid: 'me' },
        grants('PROJECT.MEMBER'),
        project,
      ),
    ).toBeDefined();
    const outsider = { ...grants('X', 'project', true), permissions: [] };
    expect(
      revealBlockedReason({ state: 'OK', user_uuid: 'me' }, outsider, project),
    ).toBeDefined();
  });

  it('lets the assignee or a manager replace an active key', () => {
    const mine = { state: 'OK' as const, user_uuid: 'me' };
    const theirs = { state: 'OK' as const, user_uuid: 'someone' };
    expect(canRotate(mine, grants('PROJECT.MEMBER'), project)).toBe(true);
    expect(canRotate(theirs, grants('PROJECT.MEMBER'), project)).toBe(false);
    expect(canRotate(theirs, grants('PROJECT.MANAGER'), project)).toBe(true);
    expect(
      canRotate(
        { state: 'Paused', user_uuid: 'me' },
        grants('PROJECT.MEMBER'),
        project,
      ),
    ).toBe(false);
  });
});

describe('who approves requests', () => {
  const withApprovers = (roles: string[]): Grants => ({
    userUuid: 'me',
    isStaff: false,
    permissions: [],
    roles: new Map(
      ['PROJECT.MANAGER', 'PROJECT.ADMIN', 'CUSTOMER.OWNER'].map((role) => [
        role,
        new Set(roles.includes(role) ? ['ORDER.APPROVE'] : []),
      ]),
    ),
  });

  it("names the roles that carry the permission, from the deployment's roles", () => {
    expect(approverRolesText(withApprovers(['CUSTOMER.OWNER']))).toBe(
      'Organisation owners',
    );
    expect(
      approverRolesText(withApprovers(['PROJECT.MANAGER', 'CUSTOMER.OWNER'])),
    ).toBe('Project managers and organisation owners');
    expect(approverRolesText(withApprovers([]))).toBeUndefined();
  });
});
