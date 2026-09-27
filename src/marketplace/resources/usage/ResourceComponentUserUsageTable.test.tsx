import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResourceComponentUserUsageTable } from './ResourceComponentUserUsageTable';

const useTableSpy = vi.fn();

// Capture the config `useTable` receives so we can assert on the built filter,
// and bypass the real React Query / SDK fetch.
vi.mock('@/table/useTable', () => ({
  useTable: (config: any) => {
    useTableSpy(config);
    return { rows: [], pagination: {} };
  },
}));

const tableSpy = vi.fn();

// The heavy Table is irrelevant here; capture the columns it would render.
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableSpy(props);
    return null;
  },
}));

// No active filter form values in these tests.
vi.mock('@/table/useFilterValues', () => ({ useFilterValues: () => ({}) }));

// Keep the filter panel out of the render tree (and its top-level date setup).
vi.mock('./ResourceUsageFilter', () => ({
  ResourceUsageFilter: () => null,
  RESOURCE_USAGE_FILTER_FORM_ID: 'ResourceUsageFilterForm',
}));

// A marketplace Resource's `resource_uuid` (backend/scope uuid) differs from its
// own `uuid`; the user-usages endpoint filters on the latter.
const resource = {
  uuid: 'marketplace-uuid',
  resource_uuid: 'backend-scope-uuid',
};
const offeringComponent = { type: 'cpu', name: 'CPU', measured_unit: 'hours' };

describe('ResourceComponentUserUsageTable', () => {
  it("queries user usage by the resource's own uuid, not the backend scope uuid", () => {
    useTableSpy.mockClear();

    render(
      <ResourceComponentUserUsageTable
        resource={resource as any}
        offeringComponent={offeringComponent as any}
        portal={{}}
      />,
    );

    const { filter } = useTableSpy.mock.calls[0][0];
    // Regression guard: previously sent `resource.resource_uuid`, leaking every
    // resource's per-user usage to staff.
    expect(filter.resource_uuid).toBe('marketplace-uuid');
    expect(filter.type).toBe('cpu');
  });
  it('labels a row with its billing period, not the time it was reported', () => {
    tableSpy.mockClear();

    render(
      <ResourceComponentUserUsageTable
        resource={resource as any}
        offeringComponent={offeringComponent as any}
        portal={{}}
      />,
    );

    const { columns } = tableSpy.mock.calls[0][0];
    const column = columns.find((c) => c.title === 'Date');
    // August usage reported on 2 September must still read as August.
    const { container } = render(
      column.render({
        row: { date: '2026-09-02T10:00:00Z', billing_period: '2026-08-01' },
      }),
    );
    expect(container.textContent).toBe('August 2026');
  });
});
