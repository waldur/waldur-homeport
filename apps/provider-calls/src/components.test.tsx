import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { Column, createTablesStore } from 'waldur-table';
import { ModalProvider } from 'waldur-ui';

import { QueryTable, TableQuery } from './components';

interface Row {
  uuid: string;
  name: string;
}

const columns: Column<Row>[] = [
  { id: 'name', title: 'Name', render: ({ row }) => row.name },
];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    uuid: `uuid-${index}`,
    name: `Row ${index + 1}`,
  }));

const makeQuery = (overrides: Partial<TableQuery<Row>>): TableQuery<Row> => ({
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn() as any,
  dataUpdatedAt: 1,
  ...overrides,
});

// What main.tsx and AppShell put around a page.
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <Provider store={createTablesStore()}>
      <ModalProvider>{children}</ModalProvider>
    </Provider>
  </QueryClientProvider>
);

describe('QueryTable', () => {
  it('shows a list a page at a time', async () => {
    render(
      <QueryTable
        table="test-paged"
        query={makeQuery({ data: makeRows(12) })}
        columns={columns}
        emptyMessage="Nothing"
      />,
      { wrapper },
    );
    expect(await screen.findByText('Row 1')).toBeTruthy();
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Row 10')).toBeTruthy();
    expect(screen.queryByText('Row 11')).toBeNull();
  });

  it('shows a preview whole, under its title', async () => {
    render(
      <QueryTable
        table="test-preview"
        title="My tasks"
        query={makeQuery({ data: makeRows(3) })}
        columns={columns}
        hasPagination={false}
        emptyMessage="Nothing"
      />,
      { wrapper },
    );
    expect(await screen.findByText('Row 3')).toBeTruthy();
    expect(screen.getByText('My tasks')).toBeTruthy();
  });

  it('shows the empty message for a list with no rows', async () => {
    render(
      <QueryTable
        table="test-empty"
        query={makeQuery({ data: [] })}
        columns={columns}
        emptyMessage="Nothing here"
      />,
      { wrapper },
    );
    expect(await screen.findByText('Nothing here')).toBeTruthy();
  });

  it('shows no rows and no empty message while the query loads', () => {
    render(
      <QueryTable
        table="test-loading"
        query={makeQuery({ isLoading: true, data: undefined })}
        columns={columns}
        emptyMessage="Nothing here"
      />,
      { wrapper },
    );
    expect(screen.getByTestId('table-content-loading')).toBeTruthy();
    expect(screen.queryByText('Nothing here')).toBeNull();
  });

  it('shows the error view when the query failed', async () => {
    render(
      <QueryTable
        table="test-error"
        query={makeQuery({ isError: true, error: new Error('boom') })}
        columns={columns}
        emptyMessage="Nothing here"
      />,
      { wrapper },
    );
    expect(await screen.findByText('Something went wrong')).toBeTruthy();
    expect(screen.queryByText('Nothing here')).toBeNull();
  });
});
