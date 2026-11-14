import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Table from '@/table/Table';

import { ManagedProjectsList } from './ManagedProjectsList';

vi.mock('@/table/Table', () => ({ default: vi.fn(() => null) }));
vi.mock('@/table/useTable', () => ({ useTable: vi.fn(() => ({})) }));
vi.mock('@/table/useFilterValues', () => ({ useFilterValues: vi.fn() }));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

// ManagedProjectViewSet.ordering_fields in waldur-mastermind. The backend
// silently ignores any other key, so a column sorted on one looks sortable
// but never changes order.
const API_ORDERING_FIELDS = [
  'created',
  'state',
  'identifier',
  'details__name',
  'project_template__name',
  'project__customer__name',
  'project_template__offering',
];

const tableProps = () => {
  render(<ManagedProjectsList />);
  return vi.mocked(Table).mock.calls.at(-1)[0] as any;
};

describe('ManagedProjectsList', () => {
  it('offers the search box', () => {
    expect(tableProps().hasQuery).toBe(true);
  });

  it('sorts only on keys the API accepts', () => {
    const orderFields = tableProps()
      .columns.map((column) => column.orderField)
      .filter(Boolean);

    expect(orderFields).toEqual(
      expect.arrayContaining([
        'details__name',
        'identifier',
        'project_template__offering',
        'project_template__name',
        'created',
        'state',
      ]),
    );
    for (const field of orderFields) {
      expect(API_ORDERING_FIELDS).toContain(field);
    }
  });
});
