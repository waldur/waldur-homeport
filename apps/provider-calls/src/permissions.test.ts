import { describe, expect, it } from 'vitest';
import { MePermission } from 'waldur-js-client';

import { APPROVE_ORDER, can, Grants } from './permissions';

const OFFERING = 'offering-1';
const CUSTOMER = 'customer-1';

const grant = (fields: Partial<MePermission>): MePermission =>
  ({
    role_name: 'ROLE',
    scope_type: 'offering',
    scope_uuid: OFFERING,
    customer_uuid: CUSTOMER,
    expiration_time: null,
    ...fields,
  }) as MePermission;

const grants = (permissions: MePermission[], carries = [APPROVE_ORDER]) =>
  ({
    isStaff: false,
    permissions,
    roles: new Map([
      ['ROLE', new Set(carries)],
      ['OTHER', new Set<string>()],
    ]),
  }) satisfies Grants;

const scopes = { offeringUuid: OFFERING, customerUuid: CUSTOMER };

describe('can', () => {
  it('is false until the grants have loaded', () => {
    expect(can(undefined, APPROVE_ORDER, scopes)).toBe(false);
  });

  it('lets staff do anything', () => {
    expect(can({ ...grants([]), isStaff: true }, APPROVE_ORDER, scopes)).toBe(
      true,
    );
  });

  it('needs a role that carries the permission', () => {
    expect(can(grants([grant({})]), APPROVE_ORDER, scopes)).toBe(true);
    expect(
      can(grants([grant({ role_name: 'OTHER' })]), APPROVE_ORDER, scopes),
    ).toBe(false);
  });

  it('counts a role on the offering or on its organisation only', () => {
    const onCustomer = grant({ scope_type: 'customer', scope_uuid: CUSTOMER });
    expect(can(grants([onCustomer]), APPROVE_ORDER, scopes)).toBe(true);
    expect(
      can(grants([grant({ scope_uuid: 'another' })]), APPROVE_ORDER, scopes),
    ).toBe(false);
    expect(
      can(grants([onCustomer]), APPROVE_ORDER, { offeringUuid: OFFERING }),
    ).toBe(false);
  });

  it('counts a service provider role only where the gate names it', () => {
    const onProvider = grant({
      scope_type: 'service_provider',
      scope_uuid: 'provider-1',
    });
    expect(can(grants([onProvider]), APPROVE_ORDER, scopes)).toBe(false);
    expect(
      can(grants([onProvider]), APPROVE_ORDER, {
        ...scopes,
        serviceProvider: true,
      }),
    ).toBe(true);
  });

  it('counts a site-wide role everywhere', () => {
    expect(
      can(
        grants([grant({ scope_type: 'global', scope_uuid: 'site' })]),
        APPROVE_ORDER,
        scopes,
      ),
    ).toBe(true);
  });

  it('ignores expired roles', () => {
    expect(
      can(
        grants([grant({ expiration_time: '2000-01-01T00:00:00Z' })]),
        APPROVE_ORDER,
        scopes,
      ),
    ).toBe(false);
  });
});
