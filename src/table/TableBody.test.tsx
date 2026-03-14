import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { TableBody } from './TableBody';

export const ROW_UUID = 1;

export const COLUMNS = [
  {
    title: 'Resource type',
    render: ({ row }) => row.type,
  },
  {
    title: 'Resource name',
    render: ({ row }) => row.name,
  },
];

const ROWS = [
  {
    type: 'OpenStack Instance',
    name: 'Web server',
    uuid: ROW_UUID,
  },
];

export const renderWrapper = (props?) =>
  render(
    <table>
      <TableBody columns={COLUMNS} rows={ROWS} {...props} />
    </table>,
  );

const expandableRow = () => <h3>Detailed info</h3>;

describe('TableBody', () => {
  it('should render a cell for each column', () => {
    renderWrapper();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length);
  });

  it('should not render expandable indicator if expandable component is not provided', () => {
    renderWrapper();
    expect(screen.queryByTestId('row-expander')).not.toBeInTheDocument();
  });

  it('should render untoggled expandable indicator if expandable component is provided', () => {
    renderWrapper({ expandableRow, toggled: {} });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length);
  });

  it('should render toggled expandable indicator according to props', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
  });

  it('should render extra row if it is expanded', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByText('Detailed info')).toBeInTheDocument();
  });

  it('expanded row colSpan should equal columns.length when no rowActions or multiSelect', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    const expandedCell = screen.getByText('Detailed info').closest('td');
    expect(expandedCell).toHaveAttribute('colspan', String(COLUMNS.length));
  });

  it('should show expander when first column is hidden', () => {
    const columnsWithHiddenFirst = [
      {
        title: 'Hidden column',
        render: ({ row }) => row.type,
        visible: false,
      },
      {
        title: 'Visible column',
        render: ({ row }) => row.name,
      },
    ];
    renderWrapper({
      columns: columnsWithHiddenFirst,
      expandableRow,
      toggled: {},
    });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
  });
});
