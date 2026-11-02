import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';

import { getScopeLink } from './scopeLink';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

const SCOPE = 'scope-uuid';
const CUSTOMER = 'customer-uuid';

const row = (scope_type: string, role_name: string, extra = {}) => ({
  scope_type,
  role_name,
  scope_uuid: SCOPE,
  customer_uuid: CUSTOMER,
  ...extra,
});

describe('getScopeLink', () => {
  beforeEach(() => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);
  });

  it('links a project role to the project dashboard', () => {
    expect(getScopeLink(row('project', 'PROJECT.ADMIN'))).toEqual({
      state: 'project.dashboard',
      params: { uuid: SCOPE },
    });
  });

  it('links a resource role to the resource', () => {
    expect(getScopeLink(row('resource', 'RESOURCE.MANAGER'))).toEqual({
      state: 'marketplace-resource-details',
      params: { resource_uuid: SCOPE },
    });
  });

  it('links a resource project role to its parent resource tab', () => {
    expect(
      getScopeLink(
        row('resource_project', 'RESOURCE_PROJECT.MEMBER', {
          resource_uuid: 'resource-uuid',
        }),
      ),
    ).toEqual({
      state: 'marketplace-resource-details',
      params: { resource_uuid: 'resource-uuid', tab: 'resource-projects' },
    });
  });

  it('leaves a resource project role without a parent resource unlinked', () => {
    expect(
      getScopeLink(row('resource_project', 'RESOURCE_PROJECT.MEMBER')),
    ).toBeNull();
  });

  it.each(['PROPOSAL.MANAGER', 'PROPOSAL.MEMBER', 'PROPOSAL.ADMIN'])(
    'links %s to the proposal',
    (role) => {
      expect(getScopeLink(row('proposal', role))).toEqual({
        state: 'proposals.manage-proposal',
        params: { proposal_uuid: SCOPE },
      });
    },
  );

  it('links a call manager to the call management page', () => {
    expect(getScopeLink(row('call', 'CALL.MANAGER'))).toEqual({
      state: 'protected-call.manage',
      params: { call_uuid: SCOPE },
    });
  });

  it('links a call reviewer to their reviewer calls', () => {
    expect(getScopeLink(row('call', 'CALL.REVIEWER'))).toEqual({
      state: 'reviews-calls',
      params: {},
    });
  });

  it('leaves a panel member unlinked, as the call may still be a draft', () => {
    expect(getScopeLink(row('call', 'CALL.PANEL_MEMBER'))).toBeNull();
  });

  it('leaves a custom call role unlinked', () => {
    expect(getScopeLink(row('call', 'CALL.CUSTOM_ROLE'))).toBeNull();
  });

  it('links a call organiser to the organisation call management', () => {
    expect(
      getScopeLink(row('call_organizer', 'CUSTOMER.CALL_ORGANIZER')),
    ).toEqual({
      state: 'call-management.dashboard',
      params: { uuid: CUSTOMER },
    });
  });

  it('leaves a call organiser unlinked when call management is off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    expect(
      getScopeLink(row('call_organizer', 'CUSTOMER.CALL_ORGANIZER')),
    ).toBeNull();
  });

  it('links an offering manager to the provider offering page', () => {
    expect(getScopeLink(row('offering', 'OFFERING.MANAGER'))).toEqual({
      state: 'marketplace-offering-details',
      params: { uuid: CUSTOMER, offering_uuid: SCOPE },
    });
  });

  it('leaves a custom offering role unlinked', () => {
    expect(getScopeLink(row('offering', 'OFFERING.CUSTOM_ROLE'))).toBeNull();
  });

  it('leaves an offering role without an organisation unlinked', () => {
    expect(
      getScopeLink(
        row('offering', 'OFFERING.MANAGER', { customer_uuid: null }),
      ),
    ).toBeNull();
  });

  it('leaves a service provider role unlinked', () => {
    expect(
      getScopeLink(row('service_provider', 'CUSTOMER.MANAGER')),
    ).toBeNull();
  });

  it('leaves an unknown scope type unlinked', () => {
    expect(getScopeLink(row('something_new', 'X.Y'))).toBeNull();
  });

  it('leaves a row without a scope unlinked', () => {
    expect(
      getScopeLink(row('project', 'PROJECT.ADMIN', { scope_uuid: null })),
    ).toBeNull();
  });
});
