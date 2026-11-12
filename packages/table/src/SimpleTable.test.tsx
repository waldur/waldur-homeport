import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SimpleTable } from './SimpleTable';

const columns = [
  { title: 'Name', render: ({ row }) => <>{row.name}</> },
  {
    title: 'Usage',
    render: ({ row }) => <>{row.usage}</>,
    className: 'text-end',
    headerClassName: 'text-end',
  },
];

const bodyRows = () => screen.getAllByRole('row').slice(1);

describe('SimpleTable', () => {
  it('renders the column titles and a row per item', () => {
    render(
      <SimpleTable
        columns={columns}
        rows={[
          { uuid: 'a', name: 'Alpha', usage: 3 },
          { uuid: 'b', name: 'Beta', usage: 5 },
        ]}
      />,
    );

    expect(
      screen.getAllByRole('columnheader').map((th) => th.textContent),
    ).toEqual(['Name', 'Usage']);
    expect(bodyRows().map((tr) => tr.textContent)).toEqual(['Alpha3', 'Beta5']);
  });

  it('puts the column classes on the header and the cells', () => {
    render(
      <SimpleTable columns={columns} rows={[{ name: 'Alpha', usage: 3 }]} />,
    );

    expect(screen.getByRole('columnheader', { name: 'Usage' })).toHaveClass(
      'text-end',
    );
    expect(within(bodyRows()[0]).getByRole('cell', { name: '3' })).toHaveClass(
      'text-end',
    );
  });

  it('keys rows by another field, or by position without one', () => {
    const { rerender } = render(
      <SimpleTable
        columns={columns}
        rowKey="name"
        rows={[{ name: 'Alpha', usage: 3 }]}
      />,
    );
    expect(bodyRows()).toHaveLength(1);

    rerender(
      <SimpleTable
        columns={columns}
        rowKey="missing"
        rows={[
          { name: 'Alpha', usage: 3 },
          { name: 'Alpha', usage: 4 },
        ]}
      />,
    );
    expect(bodyRows()).toHaveLength(2);
  });

  it.each([[[]], [undefined]])('shows just the header for rows=%j', (rows) => {
    render(<SimpleTable columns={columns} rows={rows} />);

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
