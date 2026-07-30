import { describe, expect, it } from 'vitest';

import { getPostJoinDestination } from './utils';

describe('getPostJoinDestination', () => {
  it('routes to permission requests when not auto-approved', () => {
    expect(
      getPostJoinDestination({
        auto_approved: false,
        scope_uuid: 'scope-1',
        scope_type: 'customer',
      }),
    ).toEqual({ state: 'profile.permission-requests' });
  });

  it('routes to the created project when one was provisioned', () => {
    expect(
      getPostJoinDestination({
        auto_approved: true,
        scope_uuid: 'scope-1',
        scope_type: 'customer',
        project_uuid: 'project-1',
      }),
    ).toEqual({ state: 'project.dashboard', params: { uuid: 'project-1' } });
  });

  it('routes to the scope project for project-scoped invitations', () => {
    expect(
      getPostJoinDestination({
        auto_approved: true,
        scope_uuid: 'project-scope-1',
        scope_type: 'project',
      }),
    ).toEqual({
      state: 'project.dashboard',
      params: { uuid: 'project-scope-1' },
    });
  });

  it('routes to the organization for customer-scoped invitations', () => {
    expect(
      getPostJoinDestination({
        auto_approved: true,
        scope_uuid: 'customer-1',
        scope_type: 'customer',
      }),
    ).toEqual({
      state: 'organization.dashboard',
      params: { uuid: 'customer-1' },
    });
  });

  it('keeps the organization fallback when scope_type is absent (old backend)', () => {
    expect(
      getPostJoinDestination({ auto_approved: true, scope_uuid: 'scope-1' }),
    ).toEqual({ state: 'organization.dashboard', params: { uuid: 'scope-1' } });
  });

  it('falls back to the profile for scopes without a dashboard route', () => {
    expect(
      getPostJoinDestination({
        auto_approved: true,
        scope_uuid: 'offering-1',
        scope_type: 'offering',
      }),
    ).toEqual({ state: 'profile.details' });
  });
});
