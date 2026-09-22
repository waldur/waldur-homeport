import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  getRoleDefinitionDetails,
  RoleDefinitionChanges,
  RoleEvents,
} from './events';

// The leaf components pull in the router, ENV.roles and the modal store, none
// of which this test is about. formatJsxTemplate substitutes a missing context
// key as undefined and renders nothing, so a placeholder typo would silently
// leave a hole in the sentence — that is exactly what these assertions catch.
vi.mock('@/user/affiliations/RolePopover', () => ({
  RolePopover: ({ roleName }) => <span>{roleName}</span>,
}));

vi.mock('@/events/UserDetailsLink', () => ({
  UserDetailsLink: ({ name }) => <span>{name}</span>,
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children }) => <span>{children}</span>,
}));

const format = (eventType: string, context: Record<string, string>) => {
  const event = RoleEvents.events.find((item) => item.key === eventType);
  if (!event?.formatter) {
    throw new Error(`No formatter registered for ${eventType}`);
  }
  return render(<>{event.formatter(context)}</>).container.textContent;
};

const staff = {
  user_uuid: 'aaa',
  user_full_name: 'Alice Staff',
  user_username: 'alice',
};

const role = {
  role_name: 'CUSTOMER.AUDITED',
  role_uuid: 'bbb',
};

const organization = {
  customer_uuid: 'ccc',
  customer_name: 'Acme',
};

describe('Role definition events', () => {
  it('names the actor and the role when a role is created', () => {
    expect(format('role_definition_created', { ...staff, ...role })).toBe(
      'User Alice Staff has created role CUSTOMER.AUDITED.',
    );
  });

  it('falls back to a passive sentence for system-initiated changes', () => {
    // No request user, so there is nobody to name.
    expect(format('role_definition_created', { ...role })).toBe(
      'Role CUSTOMER.AUDITED has been created.',
    );
  });

  it('distinguishes a definition change from an assignment change', () => {
    expect(format('role_definition_updated', { ...staff, ...role })).toBe(
      'User Alice Staff has changed the definition of role CUSTOMER.AUDITED.',
    );
  });

  it('names the role when it is deleted', () => {
    expect(format('role_definition_deleted', { ...staff, ...role })).toBe(
      'User Alice Staff has deleted role CUSTOMER.AUDITED.',
    );
  });

  it('names the role when it is enabled or disabled', () => {
    expect(format('role_enabled', { ...staff, ...role })).toBe(
      'User Alice Staff has enabled role CUSTOMER.AUDITED.',
    );
    expect(format('role_disabled', { ...staff, ...role })).toBe(
      'User Alice Staff has disabled role CUSTOMER.AUDITED.',
    );
  });

  it('names the template, the organization and the clone when cloning', () => {
    expect(
      format('role_cloned', {
        ...staff,
        ...organization,
        role_name: 'CUSTOMER.acme.OWNER',
        role_uuid: 'bbb',
        template_name: 'CUSTOMER.OWNER',
      }),
    ).toBe(
      'User Alice Staff has cloned role CUSTOMER.OWNER into Acme as CUSTOMER.acme.OWNER.',
    );
  });

  it('names the organization a role is concealed for and revealed to', () => {
    expect(
      format('role_concealed', { ...staff, ...role, ...organization }),
    ).toBe('User Alice Staff has concealed role CUSTOMER.AUDITED for Acme.');
    expect(
      format('role_revealed', { ...staff, ...role, ...organization }),
    ).toBe('User Alice Staff has revealed role CUSTOMER.AUDITED for Acme.');
  });

  it('registers a formatter for every role definition event', () => {
    const covered = RoleEvents.events.map((item) => item.key);
    expect(covered).toEqual(
      expect.arrayContaining([
        'role_definition_created',
        'role_definition_updated',
        'role_definition_deleted',
        'role_enabled',
        'role_disabled',
        'role_cloned',
        'role_concealed',
        'role_revealed',
      ]),
    );
  });
});

describe('Role definition change details', () => {
  const renderChanges = (context, eventType = 'role_definition_updated') =>
    render(<RoleDefinitionChanges eventType={eventType} context={context} />)
      .container.textContent;

  it('spells out which permissions the role gained and lost', () => {
    const text = renderChanges({
      added_permissions: ['CALL.CREATE'],
      removed_permissions: ['CALL.CLOSE_ROUNDS'],
    });
    expect(text).toContain('Added permissions (1)');
    expect(text).toContain('Removed permissions (1)');
    // Human labels, not raw codes: the whole point of expanding the row.
    expect(text).toContain('Create call');
    expect(text).toContain('Close rounds');
    expect(text).not.toContain('CALL.CREATE');
    expect(text).not.toContain('CALL.CLOSE_ROUNDS');
  });

  it('falls back to the code for a permission with no generated label', () => {
    expect(
      renderChanges({ added_permissions: ['SOME.UNKNOWN_CODE'] }),
    ).toContain('SOME.UNKNOWN_CODE');
  });

  it('reports a rename and a scope change under translated scope labels', () => {
    const text = renderChanges({
      old_name: 'CUSTOMER.OLD',
      role_name: 'CUSTOMER.NEW',
      old_content_type: 'customer',
      new_content_type: 'project',
    });
    expect(text).toContain('Renamed from CUSTOMER.OLD to CUSTOMER.NEW.');
    expect(text).toContain('Scope changed from Organization to Project.');
  });

  it('keeps the raw model name for a scope with no mapped label', () => {
    // The backend sends content_type.model, which diverges from the API type
    // key for a few scopes (serviceprovider vs service_provider).
    expect(
      renderChanges({
        old_content_type: 'customer',
        new_content_type: 'serviceprovider',
      }),
    ).toContain('Scope changed from Organization to serviceprovider.');
  });

  it('shows a description-only edit, which is otherwise invisible', () => {
    const text = renderChanges({
      added_permissions: [],
      removed_permissions: [],
      old_descriptions: { description: 'Old text', description_en: '' },
      new_descriptions: { description: 'New text', description_en: 'Added' },
    });
    expect(text).toContain('Description: "Old text" to "New text".');
    expect(text).toContain('Description (en) set to "Added".');
  });

  it('reports a cleared description', () => {
    expect(
      renderChanges({
        old_descriptions: { description: 'Old text' },
        new_descriptions: { description: '' },
      }),
    ).toContain('Description cleared (was "Old text").');
  });

  it('lists the permission set a role was created with or deleted carrying', () => {
    const created = renderChanges(
      { permissions: ['CALL.CREATE'] },
      'role_definition_created',
    );
    expect(created).toContain('Permissions (1)');
    expect(created).toContain('Create call');
  });

  it('renders nothing when the request changed none of these', () => {
    expect(
      renderChanges({ added_permissions: [], removed_permissions: [] }),
    ).toBe('');
  });
});

describe('Role definition details gating', () => {
  it('is null for an event that is not a definition change', () => {
    // old_name is also used by the offering review events.
    expect(
      getRoleDefinitionDetails('marketplace_offering_update_requested', {
        old_name: 'Something',
      }),
    ).toBeNull();
  });

  it('is null when a definition event carries no delta', () => {
    // The row is gated on this, so a null here is what keeps the label from
    // standing above an empty column.
    expect(
      getRoleDefinitionDetails('role_definition_updated', {
        added_permissions: [],
        removed_permissions: [],
      }),
    ).toBeNull();
  });

  it('is non-null for a description-only edit', () => {
    expect(
      getRoleDefinitionDetails('role_definition_updated', {
        old_descriptions: { description: 'a' },
        new_descriptions: { description: 'b' },
      }),
    ).not.toBeNull();
  });
});
