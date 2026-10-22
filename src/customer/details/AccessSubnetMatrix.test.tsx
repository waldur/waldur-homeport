import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { AccessSubnetMatrix } from './AccessSubnetMatrix';

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

vi.mock('@/table/useFilterValues', () => ({
  useFilterValues: () => ({}),
}));

vi.mock('@/table/Table', () => ({
  default: (props: any) => <div>{props.tableActions}</div>,
}));

vi.mock('@/table/generated/AccessSubnetsFilter', () => ({
  AccessSubnetsFilter: () => null,
  AccessSubnetsFilterFormId: 'AccessSubnetsFilter',
  selectAccessSubnetsFilter: () => ({}),
}));

const eventsButtonSpy = vi.fn();
vi.mock('@/events/FilteredEventsButton', () => ({
  FilteredEventsButton: (props: any) => {
    eventsButtonSpy(props);
    return null;
  },
}));

vi.mock('./AccessSubnetTableActions', () => ({
  AccessSubnetTableActions: () => null,
}));

vi.mock('./ProviderDefaultSubnets', () => ({
  ProviderDefaultSubnets: () => null,
}));

describe('AccessSubnetMatrix', () => {
  it('reads the history log through the organization scope', () => {
    // Without a scope the events API lists nothing to anyone but staff.
    renderWithProviders(
      <AccessSubnetMatrix
        customer={{
          uuid: 'acme',
          url: 'https://example.org/api/customers/acme/',
        }}
        canManage
      />,
    );
    expect(eventsButtonSpy.mock.lastCall[0].filter).toEqual({
      scope: 'https://example.org/api/customers/acme/',
      feature: 'access_subnets',
    });
  });
});
