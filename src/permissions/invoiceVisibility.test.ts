import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { PermissionEnum } from './enums';
import { canViewCustomerInvoices, canViewInvoices } from './invoiceVisibility';

const ORG = 'org-1';
const OTHER_ORG = 'org-2';
const PROJECT = 'project-1';
const PROVIDER = 'provider-1';

const roles = [
  {
    name: 'CUSTOMER.OWNER',
    content_type: 'customer',
    is_active: true,
    permissions: [PermissionEnum.LIST_INVOICES],
  },
  // A custom role: nothing but invoices.
  {
    name: 'CUSTOMER.REPRESENTATIVE',
    content_type: 'customer',
    is_active: true,
    permissions: [PermissionEnum.LIST_INVOICES],
  },
  // An owner role that staff narrowed for one organization.
  {
    name: 'CUSTOMER.OWNER.narrowed',
    content_type: 'customer',
    is_active: true,
    permissions: [PermissionEnum.LIST_PROJECTS],
  },
  // Roles on other scopes that wrongly carry the organization permission.
  {
    name: 'PROJECT.ODD',
    content_type: 'project',
    is_active: true,
    permissions: [PermissionEnum.LIST_INVOICES],
  },
  {
    name: 'CUSTOMER.MANAGER',
    content_type: 'service_provider',
    is_active: true,
    permissions: [PermissionEnum.LIST_INVOICES],
  },
  // A site-wide role: the backend lets it list every invoice.
  {
    name: 'GLOBAL.ACCOUNTANT',
    content_type: 'global',
    is_active: true,
    permissions: [PermissionEnum.LIST_INVOICES],
  },
  {
    name: 'GLOBAL.OTHER',
    content_type: 'global',
    is_active: true,
    permissions: [PermissionEnum.LIST_PROJECTS],
  },
];

const grant = (
  scope_type: 'customer' | 'project' | 'service_provider' | 'global',
  scope_uuid: string,
  role_name: string,
  customer_uuid: string = ORG,
) => ({ scope_type, scope_uuid, role_name, customer_uuid });

const userWith = (...permissions) =>
  ({ is_staff: false, is_support: false, permissions }) as any;

let savedRoles;
beforeEach(() => {
  savedRoles = ENV.roles;
  ENV.roles = roles as any;
});
afterEach(() => {
  ENV.roles = savedRoles;
});

describe('canViewInvoices', () => {
  it('always lets staff and support in', () => {
    expect(
      canViewInvoices({ is_staff: true, permissions: [] } as any, ORG),
    ).toBe(true);
    expect(
      canViewInvoices({ is_support: true, permissions: [] } as any, ORG),
    ).toBe(true);
  });

  it('keeps an anonymous caller out', () => {
    expect(canViewInvoices(undefined, ORG)).toBe(false);
  });

  it('accepts any organization role that carries INVOICE.LIST', () => {
    expect(
      canViewInvoices(userWith(grant('customer', ORG, 'CUSTOMER.OWNER')), ORG),
    ).toBe(true);
    expect(
      canViewInvoices(
        userWith(grant('customer', ORG, 'CUSTOMER.REPRESENTATIVE')),
        ORG,
      ),
    ).toBe(true);
  });

  it('refuses an organization role without the permission, whatever its name', () => {
    expect(
      canViewInvoices(
        userWith(grant('customer', ORG, 'CUSTOMER.OWNER.narrowed')),
        ORG,
      ),
    ).toBe(false);
  });

  it('looks at every role the user holds on the organization', () => {
    const user = userWith(
      grant('customer', ORG, 'CUSTOMER.OWNER.narrowed'),
      grant('customer', ORG, 'CUSTOMER.REPRESENTATIVE'),
    );
    expect(canViewInvoices(user, ORG)).toBe(true);
  });

  it('does not carry the permission over to another organization', () => {
    const user = userWith(grant('customer', ORG, 'CUSTOMER.REPRESENTATIVE'));
    expect(canViewInvoices(user, OTHER_ORG)).toBe(false);
  });

  it('ignores the permission on a project or service provider role', () => {
    expect(
      canViewInvoices(userWith(grant('project', PROJECT, 'PROJECT.ODD')), ORG),
    ).toBe(false);
    expect(
      canViewInvoices(
        userWith(grant('service_provider', PROVIDER, 'CUSTOMER.MANAGER')),
        ORG,
      ),
    ).toBe(false);
  });

  it('accepts a site-wide role that carries INVOICE.LIST, on any organization', () => {
    const user = userWith(grant('global', null, 'GLOBAL.ACCOUNTANT'));
    expect(canViewInvoices(user, ORG)).toBe(true);
    expect(canViewInvoices(user, OTHER_ORG)).toBe(true);
    expect(
      canViewInvoices(userWith(grant('global', null, 'GLOBAL.OTHER')), ORG),
    ).toBe(false);
  });
});

describe('canViewCustomerInvoices', () => {
  const stateFor = (user, customer) =>
    ({ workspace: { user, customer } }) as any;

  it('gates the Invoices tab on the current organization', () => {
    const user = userWith(grant('customer', ORG, 'CUSTOMER.REPRESENTATIVE'));
    expect(canViewCustomerInvoices(stateFor(user, { uuid: ORG }))).toBe(true);
    expect(canViewCustomerInvoices(stateFor(user, { uuid: OTHER_ORG }))).toBe(
      false,
    );
  });

  it('keeps everyone but staff and support out before an organization is loaded', () => {
    const user = userWith(grant('customer', ORG, 'CUSTOMER.REPRESENTATIVE'));
    expect(canViewCustomerInvoices(stateFor(user, undefined))).toBe(false);
    expect(
      canViewCustomerInvoices(
        stateFor({ is_staff: true, permissions: [] }, undefined),
      ),
    ).toBe(true);
    expect(
      canViewCustomerInvoices(
        stateFor({ is_support: true, permissions: [] }, undefined),
      ),
    ).toBe(true);
  });
});
