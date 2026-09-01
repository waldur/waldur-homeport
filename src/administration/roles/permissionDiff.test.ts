import { describe, expect, it, afterEach, beforeEach } from 'vitest';

import { ENV } from '@/core/config';

import {
  getPermissionDiff,
  getPermissionLabel,
  getRolePermissions,
  groupPermissions,
} from './permissionDiff';

describe('getPermissionDiff', () => {
  it('splits the target permissions into what it adds, drops and keeps', () => {
    expect(
      getPermissionDiff(
        ['CALL.CREATE', 'CALL.CLOSE_ROUNDS'],
        ['CALL.CREATE', 'CUSTOMER.UPDATE'],
      ),
    ).toEqual({
      added: ['CUSTOMER.UPDATE'],
      removed: ['CALL.CLOSE_ROUNDS'],
      kept: ['CALL.CREATE'],
    });
  });

  it('treats a missing permission list as an empty one', () => {
    expect(getPermissionDiff(undefined, ['CALL.CREATE'])).toEqual({
      added: ['CALL.CREATE'],
      removed: [],
      kept: [],
    });
  });
});

describe('groupPermissions', () => {
  it('groups codes into the entity groups of the permission editor', () => {
    expect(groupPermissions(['CUSTOMER.UPDATE', 'CALL.CREATE'])).toEqual([
      { label: 'Call management', codes: ['CALL.CREATE'] },
      { label: 'Customer', codes: ['CUSTOMER.UPDATE'] },
    ]);
  });

  it('keeps a code the generated description list does not know about', () => {
    expect(groupPermissions(['SOMETHING.UNKNOWN'])).toEqual([
      { label: 'Other', codes: ['SOMETHING.UNKNOWN'] },
    ]);
  });

  it('puts an unknown code in the generated "Other" group instead of a second one', () => {
    expect(
      groupPermissions(['SOMETHING.UNKNOWN', 'LEXIS_LINK.CREATE']),
    ).toEqual([
      { label: 'Other', codes: ['LEXIS_LINK.CREATE', 'SOMETHING.UNKNOWN'] },
    ]);
  });
});

describe('getPermissionLabel', () => {
  it('names a permission the way the editor names it', () => {
    expect(getPermissionLabel('CALL.CREATE')).toBe('Create call');
  });

  it('falls back to the code when there is no description for it', () => {
    expect(getPermissionLabel('SOMETHING.UNKNOWN')).toBe('SOMETHING.UNKNOWN');
  });
});

describe('getRolePermissions', () => {
  const cached = {
    uuid: 'role-1',
    name: 'PROJECT.RESEARCHER',
    permissions: ['CALL.CREATE'],
  };

  beforeEach(() => {
    (ENV.roles as any[]).push(cached);
  });

  afterEach(() => {
    const index = (ENV.roles as any[]).indexOf(cached);
    if (index !== -1) (ENV.roles as any[]).splice(index, 1);
  });

  it('uses the permissions carried by the row', () => {
    expect(
      getRolePermissions({ uuid: 'role-1', permissions: ['CUSTOMER.UPDATE'] }),
    ).toEqual(['CUSTOMER.UPDATE']);
  });

  it('falls back to the cached role list when the row is trimmed', () => {
    expect(getRolePermissions({ uuid: 'role-1' } as any)).toEqual([
      'CALL.CREATE',
    ]);
  });

  it('is undefined for a role nothing knows about, not empty', () => {
    // An unknown role must not be reported as having lost every permission.
    expect(getRolePermissions({ uuid: 'unknown' } as any)).toBeUndefined();
  });
});
