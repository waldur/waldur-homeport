import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResourceComponentUsageTable } from './ResourceComponentUsageTable';

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

// A marketplace Resource's `resource_uuid` (backend/scope uuid) differs from its
// own `uuid`; the component-usages endpoint filters on the latter.
const resource = {
  uuid: 'marketplace-uuid',
  resource_uuid: 'backend-scope-uuid',
};

describe('ResourceComponentUsageTable', () => {
  it("queries component usage by the resource's own uuid, not the backend scope uuid", () => {
    useTableSpy.mockClear();

    render(
      <ResourceComponentUsageTable resource={resource as any} portal={{}} />,
    );

    const { filter } = useTableSpy.mock.calls[0][0];
    // Regression guard: previously sent `resource.resource_uuid`, leaking every
    // resource's usage to staff.
    expect(filter.resource_uuid).toBe('marketplace-uuid');
  });

  it('adds the component type when an offering component is provided', () => {
    useTableSpy.mockClear();

    render(
      <ResourceComponentUsageTable
        resource={resource as any}
        offeringComponent={{ type: 'cpu' } as any}
        portal={{}}
      />,
    );

    const { filter } = useTableSpy.mock.calls[0][0];
    expect(filter).toEqual({ resource_uuid: 'marketplace-uuid', type: 'cpu' });
  });
});
