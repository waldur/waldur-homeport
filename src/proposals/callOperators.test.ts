import { describe, expect, it } from 'vitest';

import { states } from '@/proposals/routes';

import {
  canManageCallsOf,
  canReadAllCallWork,
  canReadCallReportsOf,
  isCallsOperator,
} from './callOperators';

const holding = (scope_type: string, role_name = '') => ({
  permissions: [{ scope_type, role_name }],
});

describe('isCallsOperator', () => {
  it.each([
    ['staff', { is_staff: true }],
    ['support', { is_support: true }],
    ['a call manager', holding('call', 'CALL.MANAGER')],
    ['a reviewer', holding('call', 'CALL.REVIEWER')],
    ['a panel member', holding('call', 'CALL.PANEL_MEMBER')],
    ['a call organiser', holding('call_organizer', 'CUSTOMER.CALL_ORGANIZER')],
  ])('keeps the call catalogue for %s', (_, user) => {
    expect(isCallsOperator(user)).toBe(true);
  });

  it.each([
    ['an applicant', holding('proposal', 'PROPOSAL.MANAGER')],
    ['a project member', holding('project', 'PROJECT.MEMBER')],
    ['nobody signed in', undefined],
  ])('not for %s', (_, user) => {
    expect(isCallsOperator(user)).toBe(false);
  });
});

describe('canReadAllCallWork', () => {
  it.each([
    ['staff', { is_staff: true }, true],
    ['support', { is_support: true }, true],
    ['a call manager', holding('call', 'CALL.MANAGER'), true],
    [
      'a call organiser',
      holding('call_organizer', 'CUSTOMER.CALL_ORGANIZER'),
      true,
    ],
    ['a reviewer', holding('call', 'CALL.REVIEWER'), false],
    ['a panel member', holding('call', 'CALL.PANEL_MEMBER'), false],
    ['an applicant', { permissions: [] }, false],
    ['nobody signed in', undefined, false],
  ])('%s: %s', (_label, user, expected) => {
    expect(canReadAllCallWork(user)).toBe(expected);
  });
});

describe('the cross-call pages', () => {
  it.each(['admin-proposals', 'admin-reviews'])('%s is guarded', (name) => {
    const state = states.find((s) => s.name === name);
    const [guard] = state.data.permissions;
    const as = (user) => guard({ workspace: { user } });
    expect(as(holding('call', 'CALL.MANAGER'))).toBe(true);
    expect(as(holding('call', 'CALL.REVIEWER'))).toBe(false);
  });
});

describe('canManageCallsOf', () => {
  const org = 'org-1';
  const on = (scope_type: string, role_name: string, customer_uuid = org) => ({
    permissions: [{ scope_type, role_name, customer_uuid }],
  });

  it.each([
    ['staff', { is_staff: true }, true],
    ['support', { is_support: true }, true],
    ['an owner of the organisation', on('customer', 'CUSTOMER.OWNER'), true],
    [
      'a call organiser of it',
      on('call_organizer', 'CUSTOMER.CALL_ORGANIZER'),
      true,
    ],
    ['a manager of one of its calls', on('call', 'CALL.MANAGER'), true],
    [
      'a manager of another organisation’s call',
      on('call', 'CALL.MANAGER', 'org-2'),
      false,
    ],
    ['a reviewer of its call', on('call', 'CALL.REVIEWER'), false],
    ['a panel member of its call', on('call', 'CALL.PANEL_MEMBER'), false],
    ['a project member in it', on('project', 'PROJECT.MEMBER'), false],
  ])('%s: %s', (_label, user, expected) => {
    expect(canManageCallsOf(user, org)).toBe(expected);
  });

  describe('every call-management page', () => {
    const pages = states.filter((s) => s.name.startsWith('call-management'));
    const root = states.find((s) => s.name === 'call-management');
    // A page's own permissions replace its parent's.
    const guardsOf = (state) =>
      state.data?.permissions ?? root.data.permissions;
    const allowed = (state, user, transition?) =>
      guardsOf(state).every((guard) =>
        guard({ workspace: { user, customer: { uuid: org } } }, transition),
      );

    it('finds them', () => {
      expect(pages.length).toBeGreaterThan(4);
    });

    it.each(pages.map((page) => [page.name, page]))(
      '%s admits the organisation’s call managers only',
      (_name, page) => {
        const transition = { params: () => ({ uuid: org }) };
        expect(allowed(page, on('call', 'CALL.MANAGER'), transition)).toBe(
          true,
        );
        expect(allowed(page, on('call', 'CALL.REVIEWER'), transition)).toBe(
          false,
        );
        // The tab strip asks with no transition: the organisation the page
        // loaded decides.
        expect(allowed(page, on('call', 'CALL.MANAGER'))).toBe(true);
        expect(allowed(page, on('call', 'CALL.REVIEWER'))).toBe(false);
      },
    );
  });
});

describe('the call reports', () => {
  const org = 'org-1';
  const on = (scope_type: string, role_name: string, customer_uuid = org) => ({
    permissions: [{ scope_type, role_name, customer_uuid }],
  });

  // The report endpoint asks for CALL.UPDATE, which an owner does not hold.
  it.each([
    ['staff', { is_staff: true }, true],
    ['support', { is_support: true }, true],
    [
      'a call organiser of it',
      on('call_organizer', 'CUSTOMER.CALL_ORGANIZER'),
      true,
    ],
    ['a manager of one of its calls', on('call', 'CALL.MANAGER'), true],
    ['an owner of the organisation', on('customer', 'CUSTOMER.OWNER'), false],
    ['a reviewer of its call', on('call', 'CALL.REVIEWER'), false],
    [
      'a manager of another organisation’s call',
      on('call', 'CALL.MANAGER', 'org-2'),
      false,
    ],
  ])('across an organisation, %s: %s', (_label, user, expected) => {
    expect(canReadCallReportsOf(user, org)).toBe(expected);
  });

  it('keeps the Reports page from an owner who may open the others', () => {
    const owner = on('customer', 'CUSTOMER.OWNER');
    const transition = { params: () => ({ uuid: org }) };
    const allowed = (name: string) =>
      states
        .find((state) => state.name === name)
        .data.permissions.every((guard) =>
          guard(
            { workspace: { user: owner, customer: { uuid: org } } },
            transition,
          ),
        );
    expect(allowed('call-management.proposal-list')).toBe(true);
    expect(allowed('call-management.reports')).toBe(false);
  });
});
