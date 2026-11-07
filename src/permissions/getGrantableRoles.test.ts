import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { hasPermission } from './hasPermission';
import { filterGrantableRoles, getGrantableRoles } from './utils';

// getGrantableRoles delegates the actual "can this user grant?" decision to
// hasPermission; mocking it isolates the helper's own responsibility: mapping
// each role's content_type to the required create-permission, forwarding the
// scope, and filtering. (hasPermission itself, incl. the staff bypass and
// scope walking, is exercised through the dialog/integration tests.)
vi.mock('./hasPermission', () => ({ hasPermission: vi.fn() }));

const mockedHasPermission = vi.mocked(hasPermission);

const user = { is_staff: false, permissions: [] } as unknown as Pick<
  User,
  'is_staff' | 'permissions'
>;
const scope = { customerId: 'c1', projectId: 'p1' };

describe('getGrantableRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps every role of the requested type when the user may grant it', () => {
    mockedHasPermission.mockReturnValue(true);

    const roles = getGrantableRoles(['project'], user, scope);

    // The mock config exposes three active project roles.
    expect(roles.map((r) => r.name)).toEqual([
      'admin',
      'manager',
      'project_role',
    ]);
  });

  it('drops every role when the user may grant none', () => {
    mockedHasPermission.mockReturnValue(undefined as any);

    expect(getGrantableRoles(['project'], user, scope)).toEqual([]);
  });

  it('maps each content_type to its create-permission and forwards the scope', () => {
    // Grant customer roles but not project roles.
    mockedHasPermission.mockImplementation(
      (_u, req) => req.permission === 'CUSTOMER.CREATE_PERMISSION',
    );

    const roles = getGrantableRoles(['customer', 'project'], user, scope);

    expect(roles.map((r) => r.content_type)).toEqual([
      'customer',
      'customer',
      'customer',
    ]);
    expect(mockedHasPermission).toHaveBeenCalledWith(user, {
      permission: 'PROJECT.CREATE_PERMISSION',
      customerId: 'c1',
      projectId: 'p1',
    });
    expect(mockedHasPermission).toHaveBeenCalledWith(user, {
      permission: 'CUSTOMER.CREATE_PERMISSION',
      customerId: 'c1',
      projectId: 'p1',
    });
  });

  describe('when a role type has no known grant-permission', () => {
    const synthetic = {
      name: 'flavor_role',
      description: 'flavor role',
      content_type: 'flavor',
      is_active: true,
    };

    beforeEach(() => {
      (ENV.roles as any[]).push(synthetic);
    });

    afterEach(() => {
      const i = (ENV.roles as any[]).indexOf(synthetic);
      if (i !== -1) (ENV.roles as any[]).splice(i, 1);
    });

    it('keeps the role without consulting hasPermission (backend stays the authority)', () => {
      mockedHasPermission.mockReturnValue(undefined as any);

      const roles = getGrantableRoles(['flavor'] as any, user, scope);

      expect(roles.map((r) => r.name)).toEqual(['flavor_role']);
      expect(mockedHasPermission).not.toHaveBeenCalled();
    });
  });
});

describe('filterGrantableRoles on a project team', () => {
  const role = (name: string, permissions: string[]) =>
    ({ name, content_type: 'project', is_active: true, permissions }) as any;
  const roles = [
    role('PROJECT.MANAGER', ['PROJECT.CREATE_PERMISSION', 'ORDER.CREATE']),
    role('PROJECT.PRINCIPAL_INVESTIGATOR', ['PROJECT.CREATE_PERMISSION']),
    role('PROJECT.COLLABORATOR', []),
  ];
  const pi = {
    is_staff: false,
    permissions: [
      {
        scope_type: 'project',
        scope_uuid: 'p1',
        role_name: 'PROJECT.PRINCIPAL_INVESTIGATOR',
      },
    ],
  } as any;

  it('offers someone managing through a project role no role beyond it', () => {
    // The team permission on the project, none on the organization.
    mockedHasPermission.mockImplementation(
      (_u, req) => !req.customerId || !!req.projectId,
    );

    const offered = filterGrantableRoles(roles, pi, scope).map((r) => r.name);

    expect(offered).toEqual([
      'PROJECT.PRINCIPAL_INVESTIGATOR',
      'PROJECT.COLLABORATOR',
    ]);
  });

  it('does not narrow someone managing the team through the organization', () => {
    mockedHasPermission.mockReturnValue(true);

    expect(filterGrantableRoles(roles, pi, scope)).toHaveLength(3);
  });
});
