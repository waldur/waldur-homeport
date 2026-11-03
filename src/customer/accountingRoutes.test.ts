import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { states as invoiceStates } from '@/invoices/routes';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';

import { states as customerStates } from './routes';

const allStates = [...customerStates, ...invoiceStates];

const allowed = (name: string, state: RootState) => {
  const route = allStates.find((s) => s.name === name);
  return (route.data.permissions ?? []).every((check) => check(state));
};

const ACCOUNTING_PAGES = [
  'organization-billing.billing',
  'organization-payment-profiles',
  'organization-payment-list',
  'project-credit-management',
];

describe('Accounting menu with affiliate earnings', () => {
  let saved;

  beforeEach(() => {
    saved = { FEATURES: ENV.FEATURES, plugins: ENV.plugins, roles: ENV.roles };
    ENV.FEATURES = { reseller: { affiliates: true } } as any;
    ENV.plugins = { WALDUR_CORE: { AFFILIATES_ENABLED: true } } as any;
    ENV.roles = [
      {
        name: RoleEnum.CUSTOMER_OWNER,
        template_name: null,
        permissions: [PermissionEnum.VIEW_CUSTOMER_ACCOUNTING],
      },
      { name: RoleEnum.CUSTOMER_READER, template_name: null, permissions: [] },
    ] as any;
  });

  afterEach(() => {
    Object.assign(ENV, saved);
  });

  const stateFor = (role: string, has_affiliate_links = true) =>
    ({
      workspace: {
        user: {
          is_staff: false,
          is_support: false,
          permissions: [
            { scope_type: 'customer', scope_uuid: 'reseller', role_name: role },
          ],
        },
        customer: {
          uuid: 'reseller',
          has_affiliate_links,
          credit: { value: 10 },
          payment_profiles: [{ is_active: true }],
        },
      },
    }) as unknown as RootState;

  it('opens to a reader of an affiliate organization with only that page', () => {
    const reader = stateFor(RoleEnum.CUSTOMER_READER);
    expect(allowed('organization-billing', reader)).toBe(true);
    expect(allowed('organization-affiliate-earnings', reader)).toBe(true);
    for (const page of ACCOUNTING_PAGES) {
      expect([page, allowed(page, reader)]).toEqual([page, false]);
    }
  });

  it('stays closed to a reader of an organization without affiliate links', () => {
    const reader = stateFor(RoleEnum.CUSTOMER_READER, false);
    expect(allowed('organization-billing', reader)).toBe(false);
    expect(allowed('organization-affiliate-earnings', reader)).toBe(false);
  });

  it('keeps every Accounting page for an owner', () => {
    const owner = stateFor(RoleEnum.CUSTOMER_OWNER);
    expect(allowed('organization-billing', owner)).toBe(true);
    expect(allowed('organization-affiliate-earnings', owner)).toBe(true);
    for (const page of ACCOUNTING_PAGES) {
      expect([page, allowed(page, owner)]).toEqual([page, true]);
    }
  });

  it('hides affiliate earnings while the program is off', () => {
    ENV.plugins = { WALDUR_CORE: { AFFILIATES_ENABLED: false } } as any;
    const reader = stateFor(RoleEnum.CUSTOMER_READER);
    expect(allowed('organization-billing', reader)).toBe(false);
    expect(allowed('organization-affiliate-earnings', reader)).toBe(false);
  });
});
