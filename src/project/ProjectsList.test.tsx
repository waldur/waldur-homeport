import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Column } from '@/table/types';

import { ProjectsList, ProjectsListTable } from './ProjectsList';

const { tableProps } = vi.hoisted(() => ({ tableProps: vi.fn() }));

vi.mock('@/table/Table', () => ({
  default: (props) => {
    tableProps(props);
    return null;
  },
}));
vi.mock('waldur-table/src/useTable', () => ({ useTable: () => ({}) }));
vi.mock('waldur-table/src/useFilterValues', () => ({
  useFilterValues: () => ({}),
}));
vi.mock('./ProjectsTableActions', () => ({ ProjectsTableActions: () => null }));

const renderedColumn = (id: string): Column =>
  tableProps.mock.lastCall[0].columns.find((column) => column.id === id);

const name = (row) => {
  const { render: Cell } = renderedColumn('administrators');
  return render(<Cell row={row} />).container.textContent;
};

describe('ProjectsListTable', () => {
  beforeEach(() => tableProps.mockClear());

  it('leaves the administrators to the list that fetches them', () => {
    render(<ProjectsListTable {...({} as any)} />);

    for (const id of ['administrators', 'uuid', 'customer_name', 'status']) {
      expect(renderedColumn(id)).toBeUndefined();
    }
  });
});

describe('ProjectsList', () => {
  beforeEach(() => tableProps.mockClear());

  it('names an administrator with no full name by email, then username', () => {
    render(<ProjectsList />);

    expect(
      name({
        administrators: [
          { user_full_name: 'Alice', user_email: 'alice@example.com' },
          { user_full_name: '', user_email: 'bob@example.com' },
          { user_full_name: '', user_email: '', user_username: 'carol' },
        ],
      }),
    ).toBe('Alice, bob@example.com, carol');
  });

  it('exports administrators with their email where there is one', () => {
    render(<ProjectsList />);
    const { export: exportRow } = renderedColumn('administrators') as any;

    expect(
      exportRow({
        administrators: [
          { user_full_name: 'Alice', user_email: 'alice@example.com' },
          { user_full_name: '', user_email: '', user_username: 'carol' },
        ],
      }),
    ).toBe('Alice <alice@example.com>; carol');
  });

  it('asks an all-pages export for the field its status is read from', () => {
    render(<ProjectsList />);

    expect(renderedColumn('status').exportKeys).toEqual(['is_removed']);
  });
});
