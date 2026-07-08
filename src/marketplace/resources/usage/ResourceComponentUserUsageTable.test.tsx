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

// The heavy Table is irrelevant here; the columns render usage rows we don't have.
vi.mock('@/table/Table', () => ({ default: () => null }));

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
});
