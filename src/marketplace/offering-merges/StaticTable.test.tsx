import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { StaticTable } from './StaticTable';

const tableSpy = vi.fn();

vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: (config: any) => {
      const [rows, setRows] = useState<any[]>([]);
      useEffect(() => {
        let alive = true;
        config
          .fetchData({ currentPage: 1, pageSize: 10 })
          .then((page: any) => alive && setRows(page.rows));
        return () => {
          alive = false;
        };
      }, []);
      return { rows, fetch: vi.fn() };
    },
  };
});

vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableSpy(props);
    return <div data-testid="table">{props.rows.length}</div>;
  },
}));

const rows = [{ name: 'one' }, { name: 'two' }];
const columns = [{ title: 'Name', render: ({ row }: any) => <>{row.name}</> }];

describe('StaticTable', () => {
  it('renders the heading itself, since the table hides it with the action bar', async () => {
    tableSpy.mockClear();
    renderWithProviders(
      <StaticTable
        table="static-with-title"
        title="Verification after the merge"
        help="Checks run automatically after the operation."
        verboseName="checks"
        rows={rows}
        columns={columns}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('table')).toHaveTextContent('2'),
    );
    expect(screen.getByTestId('section-heading')).toHaveTextContent(
      'Verification after the merge',
    );
    // The shared table draws its title inside the action bar, which is off.
    const props = tableSpy.mock.calls.at(-1)[0];
    expect(props.hasActionBar).toBe(false);
    expect(props.hideTitle).toBe(true);
    expect(props.title).toBeUndefined();
    // The heading carries the help bubble that explains the table.
    expect(screen.getByTestId('help-tip')).toBeInTheDocument();
  });

  it('renders no heading when none was given', async () => {
    renderWithProviders(
      <StaticTable
        table="static-without-title"
        verboseName="rows"
        rows={rows}
        columns={columns}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('table')).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('section-heading')).toBeNull();
    expect(screen.queryByTestId('help-tip')).toBeNull();
  });
});
