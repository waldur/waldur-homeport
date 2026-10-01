import { describe, expect, it } from 'vitest';

import { formatRoleLabel, getRoleQualifiers } from './utils';

const label = (roles, name: string) =>
  formatRoleLabel(
    roles.find((role) => role.name === name),
    getRoleQualifiers(roles),
  );

describe('role labels', () => {
  it('shows just the description when it is unique', () => {
    const roles = [
      { name: 'PROJECT.MANAGER', description: 'Project manager' },
      { name: 'PROJECT.ADMIN', description: 'Project administrator' },
    ];
    expect(label(roles, 'PROJECT.MANAGER')).toBe('Project manager');
  });

  it('falls back to the name when there is no description', () => {
    expect(label([{ name: 'PROJECT.X', description: '' }], 'PROJECT.X')).toBe(
      'PROJECT.X',
    );
  });

  it('names the owning organization of a copy, leaving the system role plain', () => {
    const roles = [
      {
        name: 'PROJECT.MANAGER',
        description: 'Project manager',
        content_type: 'project',
        is_system_role: true,
        customer_name: null,
      },
      {
        name: 'acme-project-manager',
        description: 'Project manager',
        content_type: 'project',
        is_system_role: false,
        customer_name: 'Acme',
      },
    ];
    expect(label(roles, 'PROJECT.MANAGER')).toBe('Project manager');
    expect(label(roles, 'acme-project-manager')).toBe('Project manager (Acme)');
  });

  it('marks a custom role without an organization as custom', () => {
    const roles = [
      {
        name: 'PROJECT.MANAGER',
        description: 'Manager',
        content_type: 'project',
        is_system_role: true,
      },
      {
        name: 'global-manager',
        description: 'Manager',
        content_type: 'project',
        is_system_role: false,
        customer_name: null,
      },
    ];
    expect(label(roles, 'global-manager')).toBe('Manager (Custom role)');
  });

  it('names the scope when the collision spans scopes', () => {
    const roles = [
      {
        name: 'CUSTOMER.MANAGER',
        description: 'Manager',
        content_type: 'customer',
        is_system_role: true,
      },
      {
        name: 'PROJECT.MANAGER',
        description: 'Manager',
        content_type: 'project',
        is_system_role: true,
      },
    ];
    expect(label(roles, 'CUSTOMER.MANAGER')).toBe('Manager (Organization)');
    expect(label(roles, 'PROJECT.MANAGER')).toBe('Manager (Project)');
  });

  it('keeps roles of the same name in different scopes apart', () => {
    const roles = [
      {
        uuid: 'customer-manager',
        name: 'MANAGER',
        description: 'Manager',
        content_type: 'customer' as const,
        is_system_role: true,
      },
      {
        uuid: 'project-manager',
        name: 'MANAGER',
        description: 'Manager',
        content_type: 'project' as const,
        is_system_role: true,
      },
    ];
    const qualifiers = getRoleQualifiers(roles);
    expect(formatRoleLabel(roles[0], qualifiers)).toBe(
      'Manager (Organization)',
    );
    expect(formatRoleLabel(roles[1], qualifiers)).toBe('Manager (Project)');
  });

  it('does not treat a role of unknown scope as another scope', () => {
    // SramRuleFormDialog re-adds a deactivated held role without content_type.
    const roles = [
      {
        uuid: 'active',
        name: 'PROJECT.MANAGER',
        description: 'Project manager',
        content_type: 'project',
        is_system_role: true,
      },
      {
        uuid: 'held',
        name: 'retired-manager',
        description: 'Project manager',
      },
    ];
    expect(label(roles, 'PROJECT.MANAGER')).toBe(
      'Project manager (PROJECT.MANAGER)',
    );
    expect(label(roles, 'retired-manager')).toBe(
      'Project manager (retired-manager)',
    );
  });

  it('falls back to the machine name when nothing else tells roles apart', () => {
    const roles = [
      { name: 'PROJECT.MANAGER', description: 'Manager' },
      { name: 'PROJECT.LEAD', description: 'Manager' },
    ];
    expect(label(roles, 'PROJECT.MANAGER')).toBe('Manager (PROJECT.MANAGER)');
    expect(label(roles, 'PROJECT.LEAD')).toBe('Manager (PROJECT.LEAD)');
  });
});
