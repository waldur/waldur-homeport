import { describe, expect, it } from 'vitest';

import { canManageCalls, getCallManagerCustomerUuids } from './CallPublicMenu';

const managerOf = (customerUuid: string, callUuid: string) => ({
  scope_type: 'call',
  scope_uuid: callUuid,
  role_name: 'CALL.MANAGER',
  customer_uuid: customerUuid,
});

describe('getCallManagerCustomerUuids', () => {
  it('is empty for a user with no permissions at all', () => {
    expect(getCallManagerCustomerUuids(undefined)).toEqual([]);
    expect(getCallManagerCustomerUuids({})).toEqual([]);
  });

  // Reviewers and panel members work on calls but manage nothing.
  it('ignores call roles that are not manager', () => {
    const user = {
      permissions: [
        { ...managerOf('customer-1', 'call-1'), role_name: 'CALL.REVIEWER' },
        {
          ...managerOf('customer-1', 'call-2'),
          role_name: 'CALL.PANEL_MEMBER',
        },
      ],
    };
    expect(getCallManagerCustomerUuids(user)).toEqual([]);
  });

  it('ignores roles on other scopes', () => {
    const user = {
      permissions: [
        {
          scope_type: 'customer',
          role_name: 'CALL.MANAGER',
          customer_uuid: 'c',
        },
        {
          scope_type: 'project',
          role_name: 'CALL.MANAGER',
          customer_uuid: 'c',
        },
      ],
    };
    expect(getCallManagerCustomerUuids(user)).toEqual([]);
  });

  // The common case: several calls, one council. Three permissions must not
  // read as three destinations.
  it('collapses several calls in one organisation to a single entry', () => {
    const user = {
      permissions: [
        managerOf('customer-1', 'call-1'),
        managerOf('customer-1', 'call-2'),
        managerOf('customer-1', 'call-3'),
      ],
    };
    expect(getCallManagerCustomerUuids(user)).toEqual(['customer-1']);
  });

  it('reports every organisation a user manages calls for', () => {
    const user = {
      permissions: [
        managerOf('customer-1', 'call-1'),
        managerOf('customer-2', 'call-2'),
        managerOf('customer-1', 'call-3'),
      ],
    };
    expect(getCallManagerCustomerUuids(user)).toEqual([
      'customer-1',
      'customer-2',
    ]);
  });

  // A permission without an organisation cannot be linked to; dropping it is
  // better than routing to `undefined`.
  it('drops permissions carrying no organisation', () => {
    const user = {
      permissions: [
        { ...managerOf('customer-1', 'call-1'), customer_uuid: null },
        managerOf('customer-2', 'call-2'),
      ],
    };
    expect(getCallManagerCustomerUuids(user)).toEqual(['customer-2']);
  });
});

describe('canManageCalls', () => {
  // Staff and support carry no call-scoped roles at all — verified against
  // /api/users/me/, where a staff account reports zero call permissions — so
  // scanning permissions alone would leave them with no entry point.
  it.each(['is_staff', 'is_support'])('is true for %s', (flag) => {
    const user = { [flag]: true, permissions: [] };
    expect(getCallManagerCustomerUuids(user)).toEqual([]);
    expect(canManageCalls(user)).toBe(true);
  });

  it('is true for a manager of one organisation', () => {
    expect(
      canManageCalls({ permissions: [managerOf('customer-1', 'call-1')] }),
    ).toBe(true);
  });

  it('is true for a manager of several organisations', () => {
    const user = {
      permissions: [
        managerOf('customer-1', 'call-1'),
        managerOf('customer-2', 'call-2'),
      ],
    };
    expect(canManageCalls(user)).toBe(true);
  });

  it('is false for a reviewer', () => {
    const user = {
      permissions: [
        { ...managerOf('customer-1', 'call-1'), role_name: 'CALL.REVIEWER' },
      ],
    };
    expect(canManageCalls(user)).toBe(false);
  });

  it('is false for a user with nothing at all', () => {
    expect(canManageCalls(undefined)).toBe(false);
    expect(canManageCalls({ permissions: [] })).toBe(false);
  });
});
