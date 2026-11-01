import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';

import { states } from './routes';
import { canManageProject, canOpenProjectSettings } from './settingsAccess';

const h = vi.hoisted(() => ({ chatEnabled: true }));

vi.mock('@/matrix/utils', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  isMatrixChatEnabled: () => h.chatEnabled,
}));

const ORG = 'org-1';
const PROJECT = 'project-1';

const role = (name: string, permissions: string[]) => ({ name, permissions });

const roles = [
  role(RoleEnum.CUSTOMER_OWNER, [PermissionEnum.UPDATE_PROJECT]),
  role(RoleEnum.PROJECT_MANAGER, [PermissionEnum.UPDATE_PROJECT]),
  role('ORDER.APPROVER', [PermissionEnum.APPROVE_ORDER]),
  role('METADATA.EDITOR', [PermissionEnum.UPDATE_PROJECT_METADATA]),
  role('PROJECT.REMOVER', [PermissionEnum.DELETE_PROJECT]),
  role('PROJECT.CREATOR', [PermissionEnum.CREATE_PROJECT]),
  role('ROOM.CREATOR', [PermissionEnum.CREATE_MATRIX_ROOM]),
];

const grant = (
  scope_type: 'customer' | 'project',
  scope_uuid: string,
  role_name: string,
) => ({ scope_type, scope_uuid, role_name, customer_uuid: ORG });

const userWith = (...permissions) =>
  ({ is_staff: false, is_support: false, permissions }) as any;

const stateFor = (user, project?) => ({ workspace: { user, project } }) as any;

const project = { uuid: PROJECT, customer_uuid: ORG, is_removed: false };

let savedRoles;
beforeEach(() => {
  savedRoles = ENV.roles;
  ENV.roles = roles as any;
  h.chatEnabled = true;
});
afterEach(() => {
  ENV.roles = savedRoles;
});

describe('canManageProject', () => {
  it('lets staff in', () => {
    expect(
      canManageProject(stateFor({ is_staff: true, permissions: [] }, project)),
    ).toBe(true);
  });

  it('lets an organization owner in via the project’s organization', () => {
    const owner = userWith(grant('customer', ORG, RoleEnum.CUSTOMER_OWNER));
    expect(canManageProject(stateFor(owner, project))).toBe(true);
  });

  it('lets a project manager in', () => {
    const manager = userWith(
      grant('project', PROJECT, RoleEnum.PROJECT_MANAGER),
    );
    expect(canManageProject(stateFor(manager, project))).toBe(true);
  });

  it('lets someone who can approve orders but cannot update the project', () => {
    const approver = userWith(grant('project', PROJECT, 'ORDER.APPROVER'));
    expect(canManageProject(stateFor(approver, project))).toBe(true);
  });

  it('lets support in to read', () => {
    expect(
      canManageProject(
        stateFor(
          { is_staff: false, is_support: true, permissions: [] },
          project,
        ),
      ),
    ).toBe(true);
  });

  it.each([
    ['metadata', 'project', PROJECT, 'METADATA.EDITOR'],
    ['removal', 'customer', ORG, 'PROJECT.REMOVER'],
    ['chat', 'project', PROJECT, 'ROOM.CREATOR'],
  ] as const)('lets a custom role in for %s', (_, scope, id, roleName) => {
    const user = userWith(grant(scope, id, roleName));
    expect(canOpenProjectSettings(user, project)).toBe(true);
  });

  it('refuses removal of an already removed project as a way in', () => {
    const remover = userWith(grant('customer', ORG, 'PROJECT.REMOVER'));
    expect(
      canOpenProjectSettings(remover, { ...project, is_removed: true }),
    ).toBe(false);
  });

  // The API refuses these, so each would open a page whose controls all fail.
  it('refuses removal granted on the project alone', () => {
    const remover = userWith(grant('project', PROJECT, 'PROJECT.REMOVER'));
    expect(canOpenProjectSettings(remover, project)).toBe(false);
  });

  it('refuses project creation without project update', () => {
    const creator = userWith(grant('customer', ORG, 'PROJECT.CREATOR'));
    expect(canOpenProjectSettings(creator, project)).toBe(false);
  });

  it('refuses chat as a way in where chat is off', () => {
    h.chatEnabled = false;
    const creator = userWith(grant('project', PROJECT, 'ROOM.CREATOR'));
    expect(canOpenProjectSettings(creator, project)).toBe(false);
  });

  // Such a role acts for the provider; the API refuses it on this project.
  it('refuses order approval held on a service provider', () => {
    const provider = userWith({
      ...grant('project', 'provider-1', 'ORDER.APPROVER'),
      scope_type: 'service_provider',
    });
    expect(canOpenProjectSettings(provider, project)).toBe(false);
  });

  it('refuses a member with no settings permission', () => {
    const member = userWith(grant('project', PROJECT, RoleEnum.PROJECT_MEMBER));
    expect(canManageProject(stateFor(member, project))).toBe(false);
  });

  it('refuses update permission held on a different project', () => {
    const elsewhere = userWith(
      grant('project', 'other-project', RoleEnum.PROJECT_MANAGER),
    );
    expect(canManageProject(stateFor(elsewhere, project))).toBe(false);
  });

  it('refuses a direct visit before the project is loaded', () => {
    const owner = userWith(grant('customer', ORG, RoleEnum.CUSTOMER_OWNER));
    expect(canManageProject(stateFor(owner, undefined))).toBe(false);
    expect(
      canManageProject(
        stateFor({ is_staff: true, permissions: [] }, undefined),
      ),
    ).toBe(false);
  });
});

describe('project-manage route', () => {
  it('guards the settings page with the settings access check', () => {
    const route = states.find((state) => state.name === 'project-manage');
    expect(route?.data?.permissions).toEqual([canManageProject]);
  });
});
