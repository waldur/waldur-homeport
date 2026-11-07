import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  getOfferingManagerProviders,
  getOrganisationCandidates,
} from './useProviderCallScopes';

const grant = (
  scope_type: string,
  role_name: string,
  customer_uuid: string,
  customer_name = customer_uuid,
) => ({
  scope_type,
  role_name,
  // A role on the organisation is scoped to it; one on an offering is not.
  scope_uuid:
    scope_type === 'customer'
      ? customer_uuid
      : `${scope_type}-${customer_uuid}`,
  scope_name: scope_type,
  customer_uuid,
  customer_name,
});

describe('provider call scopes', () => {
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      {
        name: 'OFFERING.MANAGER',
        permissions: ['OFFERING.ACCEPT_CALL_REQUEST'],
      },
      { name: 'CUSTOMER.OWNER', permissions: ['OFFERING.ACCEPT_CALL_REQUEST'] },
      { name: 'PROJECT.ADMIN', permissions: [] },
      { name: 'PROPOSAL.MANAGER', permissions: [] },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  it('takes an offering manager straight from the grant', () => {
    const user = {
      permissions: [
        grant('offering', 'OFFERING.MANAGER', 'south', 'Southern'),
        grant('offering', 'OFFERING.MANAGER', 'south', 'Southern'),
      ],
    } as any;
    expect(getOfferingManagerProviders(user)).toEqual([
      { uuid: 'south', name: 'Southern' },
    ]);
  });

  it('asks about owned organisations, not offering grants', () => {
    const user = {
      permissions: [
        grant('customer', 'CUSTOMER.OWNER', 'north', 'Northern'),
        grant('offering', 'OFFERING.MANAGER', 'south', 'Southern'),
      ],
    } as any;
    expect(getOrganisationCandidates(user)).toEqual([
      { uuid: 'north', name: 'Northern' },
    ]);
    expect(getOfferingManagerProviders(user)).toEqual([
      { uuid: 'south', name: 'Southern' },
    ]);
  });

  // An applicant's roles answer for no provider.
  it('finds nothing for an applicant', () => {
    const user = {
      permissions: [
        grant('project', 'PROJECT.ADMIN', 'physics'),
        grant('proposal', 'PROPOSAL.MANAGER', 'council'),
      ],
    } as any;
    expect(getOfferingManagerProviders(user)).toEqual([]);
    expect(getOrganisationCandidates(user)).toEqual([]);
  });

  it('finds nothing without a user', () => {
    expect(getOfferingManagerProviders(undefined)).toEqual([]);
    expect(getOrganisationCandidates(undefined)).toEqual([]);
  });
});
