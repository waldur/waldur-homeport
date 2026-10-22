import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useCustomer, useUser } from '@/workspace/hooks';

import {
  ProjectCreditActions,
  ProjectCreditReadOnlyActions,
} from './ProjectCreditActions';
import { ProjectCreditsList } from './ProjectCreditsList';

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

const tableSpy = vi.fn();
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableSpy(props);
    return <div data-testid="table-actions">{props.tableActions}</div>;
  },
}));

const eventsButtonSpy = vi.fn();
vi.mock('@/events/FilteredEventsButton', () => ({
  FilteredEventsButton: (props: any) => {
    eventsButtonSpy(props);
    return null;
  },
}));

vi.mock('./ProjectCreateCreditButton', () => ({
  ProjectCreateCreditButton: () => <button>Add credit</button>,
}));

const withRole = (role_name: string) => ({
  is_staff: false,
  is_support: false,
  permissions: [{ scope_type: 'customer', scope_uuid: 'acme', role_name }],
});

describe('ProjectCreditsList', () => {
  let roles;

  beforeEach(() => {
    roles = ENV.roles;
    ENV.roles = [
      {
        name: 'CUSTOMER.acme.OWNER_NO_ORDER',
        template_name: 'CUSTOMER.OWNER',
        permissions: ['CUSTOMER.VIEW_ACCOUNTING'],
      },
      {
        name: 'CUSTOMER.ACCOUNTANT',
        template_name: null,
        permissions: ['CUSTOMER.VIEW_ACCOUNTING'],
      },
    ] as any;
    tableSpy.mockClear();
    eventsButtonSpy.mockClear();
    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'acme',
      url: 'https://example.org/api/customers/acme/',
    } as any);
  });

  afterEach(() => {
    ENV.roles = roles;
  });

  it.each([
    ['an owner', withRole('CUSTOMER.OWNER')],
    ['a clone of the owner', withRole('CUSTOMER.acme.OWNER_NO_ORDER')],
    ['staff', { is_staff: true, permissions: [] }],
  ])('lets %s manage credits', (_, user) => {
    vi.mocked(useUser).mockReturnValue(user as any);
    render(<ProjectCreditsList />);
    expect(screen.getByText('Add credit')).toBeInTheDocument();
    expect(tableSpy.mock.lastCall[0].rowActions).toBe(ProjectCreditActions);
  });

  it('shows credits read-only to a non-owner who may view accounting', () => {
    // Mastermind refuses project credit writes to anyone but owners.
    vi.mocked(useUser).mockReturnValue(withRole('CUSTOMER.ACCOUNTANT') as any);
    render(<ProjectCreditsList />);
    expect(screen.queryByText('Add credit')).not.toBeInTheDocument();
    expect(tableSpy.mock.lastCall[0].rowActions).toBe(
      ProjectCreditReadOnlyActions,
    );
  });

  it('reads the history log through the organization scope', () => {
    // Without a scope the events API lists nothing to anyone but staff.
    vi.mocked(useUser).mockReturnValue(withRole('CUSTOMER.OWNER') as any);
    render(<ProjectCreditsList />);
    expect(eventsButtonSpy.mock.lastCall[0].filter).toEqual({
      feature: 'credits',
      scope: 'https://example.org/api/customers/acme/',
    });
  });
});
